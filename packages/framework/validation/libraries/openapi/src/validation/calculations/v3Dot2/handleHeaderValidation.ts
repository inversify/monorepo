import { type OpenApi3Dot2Object } from '@inversifyjs/open-api-types/v3Dot2';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import type Ajv from 'ajv';
import { type ErrorObject, type ValidateFunction } from 'ajv';

import { type HeaderValidationInputParam } from '../../models/HeaderValidationInputParam.js';
import { SCHEMA_ID } from '../../models/v3Dot2/schemaId.js';
import {
  type ValidationCacheEntry,
  type ValidationCacheEntryHeader,
} from '../../models/v3Dot2/ValidationCacheEntry.js';
import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import { buildHeaderParse } from '../buildHeaderParse.js';
import {
  getHeaderParameterObjects,
  type HeaderParameterEntry,
} from './getHeaderParameterObjects.js';

function getHeaderParameterEntryMap(
  ajv: Ajv,
  openApiObject: OpenApi3Dot2Object,
  openApiResolver: OpenApiResolver,
  inputParam: HeaderValidationInputParam,
): Map<string, ValidationCacheEntryHeader> {
  const headerParameterEntryMap: Map<string, ValidationCacheEntryHeader> =
    new Map();

  const headerParams: Map<string, HeaderParameterEntry> =
    getHeaderParameterObjects(
      openApiObject,
      openApiResolver,
      inputParam.method,
      inputParam.path,
    );

  for (const headerParam of headerParams.values()) {
    const parse: (value: string | string[] | undefined) => unknown =
      buildHeaderParse(
        openApiResolver,
        headerParam.parameter.schema,
        `${SCHEMA_ID}#/${headerParam.pointerPrefix}/schema`,
      );

    const ajvSchemaPointer: string = `${SCHEMA_ID}#/${headerParam.pointerPrefix}/schema`;

    const validate: ValidateFunction | undefined =
      ajv.getSchema(ajvSchemaPointer);

    if (validate === undefined) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.validationFailed,
        `Unable to find schema for pointer: ${ajvSchemaPointer}`,
      );
    }

    headerParameterEntryMap.set(headerParam.parameter.name, {
      parse,
      required: headerParam.parameter.required ?? false,
      validate: validate,
    });
  }

  return headerParameterEntryMap;
}

export function handleHeaderValidation(
  ajv: Ajv,
  openApiObject: OpenApi3Dot2Object,
  openApiResolver: OpenApiResolver,
  inputParam: HeaderValidationInputParam,
  getEntry: (path: string, method: string) => ValidationCacheEntry,
): unknown {
  const validationCacheEntry: ValidationCacheEntry = getEntry(
    inputParam.path,
    inputParam.method,
  );

  if (validationCacheEntry.headers === undefined) {
    validationCacheEntry.headers = getHeaderParameterEntryMap(
      ajv,
      openApiObject,
      openApiResolver,
      inputParam,
    );
  }

  const computedHeaders: Record<string, unknown> = {
    ...inputParam.headers,
  };

  let valid: boolean = true;
  const headerToErrorObject: Record<string, ErrorObject[]> = {};

  for (const [
    headerName,
    validationCacheEntryHeader,
  ] of validationCacheEntry.headers) {
    if (!(headerName in inputParam.headers)) {
      if (validationCacheEntryHeader.required) {
        throw new InversifyValidationError(
          InversifyValidationErrorKind.validationFailed,
          `Missing required header: ${headerName}`,
        );
      }

      continue;
    }

    const headerValue: string | string[] | undefined =
      inputParam.headers[headerName];

    computedHeaders[headerName] = validationCacheEntryHeader.parse(headerValue);

    const isValidHeader: boolean = validationCacheEntryHeader.validate(
      computedHeaders[headerName],
    );

    if (!isValidHeader) {
      valid = false;

      headerToErrorObject[headerName] = [
        ...(validationCacheEntryHeader.validate.errors ?? []),
      ];
    }
  }

  if (!valid) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      Object.entries(headerToErrorObject)
        .map(([headerName, errors]: [string, ErrorObject[]]): string =>
          errors
            .map(
              (error: ErrorObject): string =>
                `[header: ${headerName}, schemaPath: ${error.schemaPath}, instancePath: ${error.instancePath}]: "${error.message ?? '-'}"`,
            )
            .join('\n'),
        )
        .join('\n'),
    );
  }

  return computedHeaders;
}
