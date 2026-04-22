import { type OpenApi3Dot2Object } from '@inversifyjs/open-api-types/v3Dot2';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import type Ajv from 'ajv';
import { type ErrorObject, type ValidateFunction } from 'ajv';

import { type OpenApiValidationContext } from '../../models/OpenApiValidationContext.js';
import { type ParamValidationInputParam } from '../../models/ParamValidationInputParam.js';
import { SCHEMA_ID } from '../../models/v3Dot2/schemaId.js';
import {
  type ValidationCacheEntry,
  type ValidationCacheEntryParam,
} from '../../models/v3Dot2/ValidationCacheEntry.js';
import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import { buildParamParse } from '../buildParamParse.js';
import {
  getParamParameterObjects,
  type ParamParameterEntry,
} from './getParamParameterObjects.js';

function getParamParameterEntryMap(
  ajv: Ajv,
  openApiObject: OpenApi3Dot2Object,
  openApiResolver: OpenApiResolver,
  method: string,
  route: string,
): Map<string, ValidationCacheEntryParam> {
  const paramParameterEntryMap: Map<string, ValidationCacheEntryParam> =
    new Map();

  const paramParams: Map<string, ParamParameterEntry> =
    getParamParameterObjects(openApiObject, openApiResolver, method, route);

  for (const [paramName, paramParam] of paramParams) {
    const parse: (value: string | string[] | undefined) => unknown =
      buildParamParse(
        openApiResolver,
        paramParam.parameter.schema,
        `${SCHEMA_ID}#/${paramParam.pointerPrefix}/schema`,
      );

    const ajvSchemaPointer: string = `${SCHEMA_ID}#/${paramParam.pointerPrefix}/schema`;

    const validate: ValidateFunction | undefined =
      ajv.getSchema(ajvSchemaPointer);

    if (validate === undefined) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.validationFailed,
        `Unable to find schema for pointer: ${ajvSchemaPointer}`,
      );
    }

    paramParameterEntryMap.set(paramName, {
      parse,
      validate: validate,
    });
  }

  return paramParameterEntryMap;
}

export function handleParamValidation(
  ajv: Ajv,
  openApiObject: OpenApi3Dot2Object,
  validationContext: OpenApiValidationContext,
  inputParam: ParamValidationInputParam,
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

  if (validationCacheEntry.params === undefined) {
    validationCacheEntry.params = getParamParameterEntryMap(
      ajv,
      openApiObject,
      validationContext.resolver,
      inputParam.method,
      route,
    );
  }

  const computedParams: Record<string, unknown> = {
    ...inputParam.params,
  };

  let valid: boolean = true;
  const paramToErrorObject: Record<string, ErrorObject[]> = {};

  for (const [
    paramName,
    validationCacheEntryParam,
  ] of validationCacheEntry.params) {
    if (!(paramName in inputParam.params)) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.validationFailed,
        `Missing required param: ${paramName}`,
      );
    }

    const paramValue: string | string[] | undefined =
      inputParam.params[paramName];

    computedParams[paramName] = validationCacheEntryParam.parse(paramValue);

    const isValidParam: boolean = validationCacheEntryParam.validate(
      computedParams[paramName],
    );

    if (!isValidParam) {
      valid = false;

      paramToErrorObject[paramName] = [
        ...(validationCacheEntryParam.validate.errors ?? []),
      ];
    }
  }

  if (!valid) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      Object.entries(paramToErrorObject)
        .map(([paramName, errors]: [string, ErrorObject[]]): string =>
          errors
            .map(
              (error: ErrorObject): string =>
                `[param: ${paramName}, schemaPath: ${error.schemaPath}, instancePath: ${error.instancePath}]: "${error.message ?? '-'}"`,
            )
            .join('\n'),
        )
        .join('\n'),
    );
  }

  return computedParams;
}
