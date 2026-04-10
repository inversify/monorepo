import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import {
  type OpenApi3Dot2Object,
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot2';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import type Ajv from 'ajv';
import { type ErrorObject, type ValidateFunction } from 'ajv';

import { type BodyValidationInputParam } from '../../models/BodyValidationInputParam.js';
import { SCHEMA_ID } from '../../models/v3Dot2/schemaId.js';
import { type ValidationCacheEntry } from '../../models/v3Dot2/ValidationCacheEntry.js';
import { getPath } from '../getPath.js';
import { getOperationObject } from './getOperationObject.js';
import { getRequestBodyObject } from './getRequestBodyObject.js';
import { inferContentType } from './inferContentType.js';

function getValidateFunction(
  ajv: Ajv,
  openApiObject: OpenApi3Dot2Object,
  path: string,
  method: string,
  contentType: string | undefined,
): ValidateFunction {
  const operationObject: OpenApi3Dot2OperationObject = getOperationObject(
    openApiObject,
    method,
    path,
  );

  const openApi3Dot2RequestBodyObject: OpenApi3Dot2RequestBodyObject =
    getRequestBodyObject(openApiObject, operationObject, method, path);

  const inferredContentType: string =
    contentType ?? inferContentType(openApi3Dot2RequestBodyObject, method);

  const schemaPointer: string = `${SCHEMA_ID}#/${escapeJsonPointerFragments(
    'paths',
    path,
    method,
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
  openApiObject: OpenApi3Dot2Object,
  inputParam: BodyValidationInputParam<unknown>,
  getEntry: (path: string, method: string) => ValidationCacheEntry,
): unknown {
  const path: string = getPath(inputParam.url);
  const method: string = inputParam.method.toLowerCase();
  const contentType: string | undefined = inputParam.contentType;

  const validationCacheEntry: ValidationCacheEntry = getEntry(path, method);

  let validate: ValidateFunction | undefined =
    validationCacheEntry.body.get(contentType);

  if (validate === undefined) {
    validate = getValidateFunction(
      ajv,
      openApiObject,
      path,
      method,
      contentType,
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
