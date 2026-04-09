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
import { getPath } from '../getPath.js';
import { getOperationObject } from './getOperationObject.js';
import { getRequestBodyObject } from './getRequestBodyObject.js';
import { inferContentType } from './inferContentType.js';

export function handleBodyValidation(
  ajv: Ajv,
  openApiObject: OpenApi3Dot1Object,
  inputParam: BodyValidationInputParam<unknown>,
): unknown {
  const path: string = getPath(inputParam.url);
  const method: string = inputParam.method.toLowerCase();
  const contentType: string | undefined = inputParam.contentType;

  const operationObject: OpenApi3Dot1OperationObject = getOperationObject(
    openApiObject,
    method,
    path,
  );

  const openApi3Dot1RequestBodyObject: OpenApi3Dot1RequestBodyObject =
    getRequestBodyObject(openApiObject, operationObject, method, path);

  const inferredContentType: string =
    contentType ?? inferContentType(openApi3Dot1RequestBodyObject, method);

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
