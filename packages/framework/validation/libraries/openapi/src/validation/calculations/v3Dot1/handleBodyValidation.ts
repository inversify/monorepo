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
import { type ValidationCacheEntry } from '../../models/v3Dot1/ValidationCacheEntry.js';
import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import { getOperationObject } from './getOperationObject.js';
import { getRequestBodyObject } from './getRequestBodyObject.js';
import { inferContentType } from './inferContentType.js';

function getValidateFunction(
  ajv: Ajv,
  openApiObject: OpenApi3Dot1Object,
  openApiResolver: OpenApiResolver,
  inputParam: BodyValidationInputParam<unknown>,
): ValidateFunction {
  const operationObject: OpenApi3Dot1OperationObject = getOperationObject(
    openApiObject,
    inputParam.method,
    inputParam.path,
  );

  const openApi3Dot1RequestBodyObject: OpenApi3Dot1RequestBodyObject =
    getRequestBodyObject(openApiResolver, operationObject, inputParam);

  const inferredContentType: string =
    inputParam.contentType ??
    inferContentType(openApi3Dot1RequestBodyObject, inputParam.method);

  const schemaPointer: string = `${SCHEMA_ID}#/${escapeJsonPointerFragments(
    'paths',
    inputParam.path,
    inputParam.method,
    'requestBody',
    'content',
    inferredContentType,
    'schema',
  )}`;

  const validate: ValidateFunction | undefined = ajv.getSchema(schemaPointer);

  if (validate === undefined) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `Unable to find schema for pointer: ${schemaPointer}`,
    );
  }

  return validate;
}

export function handleBodyValidation(
  ajv: Ajv,
  openApiObject: OpenApi3Dot1Object,
  openApiResolver: OpenApiResolver,
  inputParam: BodyValidationInputParam<unknown>,
  getEntry: (path: string, method: string) => ValidationCacheEntry,
): unknown {
  const contentType: string | undefined = inputParam.contentType;

  const validationCacheEntry: ValidationCacheEntry = getEntry(
    inputParam.path,
    inputParam.method,
  );

  let validate: ValidateFunction | undefined =
    validationCacheEntry.body.get(contentType);

  if (validate === undefined) {
    validate = getValidateFunction(
      ajv,
      openApiObject,
      openApiResolver,
      inputParam,
    );

    validationCacheEntry.body.set(contentType, validate);
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
