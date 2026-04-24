import { type OpenApi3Dot2Object } from '@inversifyjs/open-api-types/v3Dot2';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import type Ajv from 'ajv';
import { type ErrorObject, type ValidateFunction } from 'ajv';

import { type OpenApiValidationContext } from '../../models/OpenApiValidationContext.js';
import { type QueryValidationInputParam } from '../../models/QueryValidationInputParam.js';
import { SCHEMA_ID } from '../../models/v3Dot2/schemaId.js';
import {
  type ValidationCacheEntry,
  type ValidationCacheEntryQuery,
} from '../../models/v3Dot2/ValidationCacheEntry.js';
import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import { buildQueryParse } from '../buildQueryParse.js';
import {
  getQueryParameterObjects,
  type QueryParameterEntry,
} from './getQueryParameterObjects.js';

function getQueryParameterEntryMap(
  ajv: Ajv,
  openApiObject: OpenApi3Dot2Object,
  openApiResolver: OpenApiResolver,
  method: string,
  route: string,
): Map<string, ValidationCacheEntryQuery> {
  const queryParameterEntryMap: Map<string, ValidationCacheEntryQuery> =
    new Map();

  const queryParams: Map<string, QueryParameterEntry> =
    getQueryParameterObjects(openApiObject, openApiResolver, method, route);

  for (const [queryName, queryParam] of queryParams) {
    const parse: (value: unknown) => unknown = buildQueryParse(
      openApiResolver,
      queryParam.parameter.schema,
      `${SCHEMA_ID}#/${queryParam.pointerPrefix}/schema`,
    );

    const ajvSchemaPointer: string = `${SCHEMA_ID}#/${queryParam.pointerPrefix}/schema`;

    const validate: ValidateFunction | undefined =
      ajv.getSchema(ajvSchemaPointer);

    if (validate === undefined) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.validationFailed,
        `Unable to find schema for pointer: ${ajvSchemaPointer}`,
      );
    }

    queryParameterEntryMap.set(queryName, {
      parse,
      required: queryParam.parameter.required ?? false,
      validate: validate,
    });
  }

  return queryParameterEntryMap;
}

export function handleQueryValidation(
  ajv: Ajv,
  openApiObject: OpenApi3Dot2Object,
  validationContext: OpenApiValidationContext,
  inputParam: QueryValidationInputParam,
  getEntry: (path: string, method: string) => ValidationCacheEntry,
): unknown {
  const route: string | undefined = validationContext.router.findRoute(
    inputParam.method,
    inputParam.path,
  );

  if (route === undefined) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `Unable to find route for operation: ${inputParam.method.toUpperCase()} ${inputParam.path}`,
    );
  }

  const validationCacheEntry: ValidationCacheEntry = getEntry(
    route,
    inputParam.method,
  );

  if (validationCacheEntry.queries === undefined) {
    validationCacheEntry.queries = getQueryParameterEntryMap(
      ajv,
      openApiObject,
      validationContext.resolver,
      inputParam.method,
      route,
    );
  }

  const computedQueries: Record<string, unknown> = {
    ...inputParam.queries,
  };

  let valid: boolean = true;
  const queryToErrorObject: Record<string, ErrorObject[]> = {};

  for (const [
    queryName,
    validationCacheEntryQuery,
  ] of validationCacheEntry.queries) {
    if (!(queryName in inputParam.queries)) {
      if (validationCacheEntryQuery.required) {
        throw new InversifyValidationError(
          InversifyValidationErrorKind.validationFailed,
          `Missing required query: ${queryName}`,
        );
      }

      continue;
    }

    const queryValue: unknown = inputParam.queries[queryName];

    computedQueries[queryName] = validationCacheEntryQuery.parse(queryValue);

    const isValidQuery: boolean = validationCacheEntryQuery.validate(
      computedQueries[queryName],
    );

    if (!isValidQuery) {
      valid = false;

      queryToErrorObject[queryName] = [
        ...(validationCacheEntryQuery.validate.errors ?? []),
      ];
    }
  }

  if (!valid) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      Object.entries(queryToErrorObject)
        .map(([queryName, errors]: [string, ErrorObject[]]): string =>
          errors
            .map(
              (error: ErrorObject): string =>
                `[query: ${queryName}, schemaPath: ${error.schemaPath}, instancePath: ${error.instancePath}]: "${error.message ?? '-'}"`,
            )
            .join('\n'),
        )
        .join('\n'),
    );
  }

  return computedQueries;
}
