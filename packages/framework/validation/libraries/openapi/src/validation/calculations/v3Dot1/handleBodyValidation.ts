import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import {
  type OpenApi3Dot1Object,
  type OpenApi3Dot1OperationObject,
  type OpenApi3Dot1RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import type Ajv from 'ajv';
import { type ErrorObject, type ValidateFunction } from 'ajv';

import { type BodyValidationInputParam } from '../../models/BodyValidationInputParam.js';
import { SCHEMA_ID } from '../../models/v3Dot1/schemaId.js';
import {
  type ValidationCacheEntry,
  type ValidationCacheEntryBody,
} from '../../models/v3Dot1/ValidationCacheEntry.js';
import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import { getOperationObject } from './getOperationObject.js';
import { getRequestBodyObject } from './getRequestBodyObject.js';

function getValidationCacheEntryBody(
  ajv: Ajv,
  openApiObject: OpenApi3Dot1Object,
  openApiResolver: OpenApiResolver,
  inputParam: BodyValidationInputParam<unknown>,
): ValidationCacheEntryBody {
  const operationObject: OpenApi3Dot1OperationObject = getOperationObject(
    openApiObject,
    inputParam.method,
    inputParam.path,
  );

  const openApi3Dot1RequestBodyObject: OpenApi3Dot1RequestBodyObject =
    getRequestBodyObject(openApiResolver, operationObject, inputParam);

  const required: boolean = openApi3Dot1RequestBodyObject.required ?? false;

  const contentToValidateMap: Map<string | undefined, ValidateFunction> =
    new Map();

  const contentTypes: string[] = Object.keys(
    openApi3Dot1RequestBodyObject.content,
  );

  for (const contentType of contentTypes) {
    const schemaPointer: string = `${SCHEMA_ID}#/${escapeJsonPointerFragments(
      'paths',
      inputParam.path,
      inputParam.method,
      'requestBody',
      'content',
      contentType,
      'schema',
    )}`;

    const validate: ValidateFunction | undefined = ajv.getSchema(schemaPointer);

    if (validate === undefined) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.unknown,
        `Unable to find schema for pointer: ${schemaPointer}`,
      );
    }

    contentToValidateMap.set(contentType, validate);
  }

  if (contentTypes.length === 1) {
    const [contentType]: [string] = contentTypes as [string];

    contentToValidateMap.set(
      undefined,
      contentToValidateMap.get(contentType) as ValidateFunction,
    );
  }

  return {
    contentToValidateMap,
    required,
  };
}

function handleRequiredBodyValidation(
  validationCacheEntryBody: ValidationCacheEntryBody,
  inputParam: BodyValidationInputParam<unknown>,
): unknown {
  const validate: ValidateFunction | undefined =
    validationCacheEntryBody.contentToValidateMap.get(inputParam.contentType);

  if (validate === undefined) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `Unable to find schema for operation: ${inputParam.method.toUpperCase()} ${inputParam.path} with content type: ${inputParam.contentType ?? '-'}`,
    );
  }

  const valid: boolean = validate(inputParam.body);

  if (!valid) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      (validate.errors ?? [])
        .map(
          (error: ErrorObject): string =>
            `[schema: ${error.schemaPath}, instance: ${error.instancePath}]: "${error.message ?? '-'}"`,
        )
        .join('\n'),
    );
  }

  return inputParam.body;
}

export function handleBodyValidation(
  ajv: Ajv,
  openApiObject: OpenApi3Dot1Object,
  openApiResolver: OpenApiResolver,
  inputParam: BodyValidationInputParam<unknown>,
  getEntry: (path: string, method: string) => ValidationCacheEntry,
): unknown {
  const validationCacheEntry: ValidationCacheEntry = getEntry(
    inputParam.path,
    inputParam.method,
  );

  if (validationCacheEntry.body === undefined) {
    validationCacheEntry.body = getValidationCacheEntryBody(
      ajv,
      openApiObject,
      openApiResolver,
      inputParam,
    );
  }

  if (validationCacheEntry.body.required) {
    return handleRequiredBodyValidation(validationCacheEntry.body, inputParam);
  }

  if (inputParam.body === undefined || inputParam.body === '') {
    return undefined;
  }

  console.log('### BODY ###', JSON.stringify(inputParam.body));

  return handleRequiredBodyValidation(validationCacheEntry.body, inputParam);
}
