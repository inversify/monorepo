import { type JsonValue } from '@inversifyjs/json-schema-types';
import {
  type OpenApi3Dot1ParameterObject,
  type OpenApi3Dot1ReferenceObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import { InversifyValidationErrorKind } from '@inversifyjs/validation-common';

import { InversifyOpenApiValidationError } from '../../../models/InversifyOpenApiValidationError.js';
import {
  type OpenApiRefResolutionResult,
  type OpenApiResolver,
} from '../../services/OpenApiResolver.js';
import { pointerPrefixFromResolutionChain } from './pointerPrefixFromResolutionChain.js';

export interface ResolvedParameterObject {
  parameter: OpenApi3Dot1ParameterObject;
  pointerPrefix: string | undefined;
}

function isReferenceObject(
  param: OpenApi3Dot1ParameterObject | OpenApi3Dot1ReferenceObject,
): param is OpenApi3Dot1ReferenceObject {
  return '$ref' in param;
}

function isParameterObject(
  value: JsonValue,
): value is JsonValue & OpenApi3Dot1ParameterObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    typeof (value as Partial<OpenApi3Dot1ParameterObject>).in === 'string' &&
    typeof (value as Partial<OpenApi3Dot1ParameterObject>).name === 'string'
  );
}

export function resolveParameterObject(
  openApiResolver: OpenApiResolver,
  raw: OpenApi3Dot1ParameterObject | OpenApi3Dot1ReferenceObject,
  method: string,
  path: string,
  index: number,
): ResolvedParameterObject {
  if (!isReferenceObject(raw)) {
    return {
      parameter: raw,
      pointerPrefix: undefined,
    };
  }

  const result: OpenApiRefResolutionResult =
    openApiResolver.resolveOpenApiReference(raw as unknown as JsonValue);

  if (!result.isRight) {
    throw new InversifyOpenApiValidationError(
      InversifyValidationErrorKind.validationFailed,
      `Could not resolve $ref pointer ${raw.$ref} for parameter at path: ${path} and method: ${method} and index: ${String(index)}: ${result.value.reason}`,
    );
  }

  const resolvedRef: JsonValue = result.value.value;

  if (!isParameterObject(resolvedRef)) {
    throw new InversifyOpenApiValidationError(
      InversifyValidationErrorKind.validationFailed,
      `Resolved $ref pointer ${raw.$ref} is not a valid parameter object at path: ${path} and method: ${method} and index: ${String(index)}`,
    );
  }

  return {
    parameter: resolvedRef,
    pointerPrefix: pointerPrefixFromResolutionChain(result.value.chain),
  };
}
