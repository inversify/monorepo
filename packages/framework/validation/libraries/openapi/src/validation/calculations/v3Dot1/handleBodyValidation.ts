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
import { type OpenApiValidationContext } from '../../models/OpenApiValidationContext.js';
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
  method: string,
  route: string,
): ValidationCacheEntryBody {
  const operationObject: OpenApi3Dot1OperationObject = getOperationObject(
    openApiObject,
    method,
    route,
  );

  const openApi3Dot1RequestBodyObject: OpenApi3Dot1RequestBodyObject =
    getRequestBodyObject(openApiResolver, operationObject, method, route);

  const required: boolean = openApi3Dot1RequestBodyObject.required ?? false;

  const contentToValidateMap: Map<string | undefined, ValidateFunction> =
    new Map();

  const contentTypes: string[] = Object.keys(
    openApi3Dot1RequestBodyObject.content,
  );

  for (const contentType of contentTypes) {
    const schemaPointer: string = `${SCHEMA_ID}#/${escapeJsonPointerFragments(
      'paths',
      route,
      method,
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
  route: string,
): unknown {
  const validate: ValidateFunction | undefined =
    validationCacheEntryBody.contentToValidateMap.get(inputParam.contentType);

  if (validate === undefined) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `Unable to find schema for operation: ${inputParam.method.toUpperCase()} ${route} with content type: ${inputParam.contentType ?? '-'}`,
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
  validationContext: OpenApiValidationContext,
  inputParam: BodyValidationInputParam<unknown>,
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

  if (validationCacheEntry.body === undefined) {
    validationCacheEntry.body = getValidationCacheEntryBody(
      ajv,
      openApiObject,
      validationContext.resolver,
      inputParam.method,
      route,
    );
  }

  if (validationCacheEntry.body.required) {
    return handleRequiredBodyValidation(
      validationCacheEntry.body,
      inputParam,
      route,
    );
  }

  if (inputParam.body === undefined || inputParam.body === '') {
    return undefined;
  }

  return handleRequiredBodyValidation(
    validationCacheEntry.body,
    inputParam,
    route,
  );
}
