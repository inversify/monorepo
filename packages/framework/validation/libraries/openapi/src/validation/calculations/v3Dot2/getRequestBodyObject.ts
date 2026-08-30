import { type JsonValue } from '@inversifyjs/json-schema-types';
import {
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2ReferenceObject,
  type OpenApi3Dot2RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot2';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { InversifyOpenApiValidationError } from '../../../models/InversifyOpenApiValidationError.js';
import {
  type OpenApiRefResolutionResult,
  type OpenApiResolver,
} from '../../services/OpenApiResolver.js';
import { pointerPrefixFromResolutionChain } from './pointerPrefixFromResolutionChain.js';

export interface ResolvedRequestBodyObject {
  pointerPrefix: string | undefined;
  requestBody: OpenApi3Dot2RequestBodyObject;
}

function isRequestBodyObject(
  value: JsonValue,
): value is JsonValue & OpenApi3Dot2RequestBodyObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const content: JsonValue | undefined = value['content'];

  return (
    typeof content === 'object' && content !== null && !Array.isArray(content)
  );
}

export function getRequestBodyObject(
  openApiResolver: OpenApiResolver,
  operationObject: OpenApi3Dot2OperationObject,
  method: string,
  route: string,
): ResolvedRequestBodyObject {
  const requestBodyObject:
    OpenApi3Dot2RequestBodyObject | OpenApi3Dot2ReferenceObject | undefined =
    operationObject.requestBody;

  if (requestBodyObject === undefined) {
    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `No requestBody found for ${method.toUpperCase()} ${route}`,
    );
  }

  if (!('$ref' in requestBodyObject)) {
    return {
      pointerPrefix: undefined,
      requestBody: requestBodyObject,
    };
  }

  const result: OpenApiRefResolutionResult =
    openApiResolver.resolveOpenApiReference(
      requestBodyObject as unknown as JsonValue,
    );

  if (!result.isRight) {
    throw new InversifyOpenApiValidationError(
      InversifyValidationErrorKind.validationFailed,
      `Could not resolve $ref pointer ${requestBodyObject.$ref} for ${method.toUpperCase()} ${route}: ${result.value.reason}`,
    );
  }

  const resolvedRef: JsonValue = result.value.value;

  if (!isRequestBodyObject(resolvedRef)) {
    throw new InversifyOpenApiValidationError(
      InversifyValidationErrorKind.validationFailed,
      `Resolved $ref pointer ${requestBodyObject.$ref} is not a valid request body object for ${method.toUpperCase()} ${route}`,
    );
  }

  return {
    pointerPrefix: pointerPrefixFromResolutionChain(result.value.chain),
    requestBody: resolvedRef,
  };
}
