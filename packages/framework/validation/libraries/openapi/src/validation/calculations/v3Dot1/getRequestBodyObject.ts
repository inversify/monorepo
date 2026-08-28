import { type JsonValue } from '@inversifyjs/json-schema-types';
import {
  type OpenApi3Dot1OperationObject,
  type OpenApi3Dot1ReferenceObject,
  type OpenApi3Dot1RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import {
  type OpenApiRefResolutionResult,
  type OpenApiResolver,
} from '../../services/OpenApiResolver.js';

export function getRequestBodyObject(
  openApiResolver: OpenApiResolver,
  operationObject: OpenApi3Dot1OperationObject,
  method: string,
  route: string,
): OpenApi3Dot1RequestBodyObject {
  const requestBodyObject:
    OpenApi3Dot1RequestBodyObject | OpenApi3Dot1ReferenceObject | undefined =
    operationObject.requestBody;

  if (requestBodyObject === undefined) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `No requestBody found for ${method.toUpperCase()} ${route}`,
    );
  }

  if (!('$ref' in requestBodyObject)) {
    return requestBodyObject;
  }

  const result: OpenApiRefResolutionResult =
    openApiResolver.resolveOpenApiReference(
      requestBodyObject as unknown as JsonValue,
    );

  if (!result.isRight) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `Could not resolve $ref pointer ${requestBodyObject.$ref} for ${method.toUpperCase()} ${route}: ${result.value.reason}`,
    );
  }

  const resolvedRef: JsonValue = result.value.value;

  if (
    resolvedRef === null ||
    typeof resolvedRef !== 'object' ||
    Array.isArray(resolvedRef)
  ) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `Resolved $ref pointer ${requestBodyObject.$ref} is not a valid request body object for ${method.toUpperCase()} ${route}`,
    );
  }

  return resolvedRef as unknown as OpenApi3Dot1RequestBodyObject;
}
