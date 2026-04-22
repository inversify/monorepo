import type Ajv from 'ajv';

import { type OpenApiValidationContext } from '../models/OpenApiValidationContext.js';
import { type ValidationInputParam } from '../models/ValidatedDecoratorResult.js';
import {
  type validatedInputParamBodyType,
  type validatedInputParamHeaderType,
  type validatedInputParamParamType,
} from '../models/validatedInputParamTypes.js';
import { type ValidationHandler } from '../models/ValidationHandler.js';

type ValidatedInputParamType =
  | typeof validatedInputParamBodyType
  | typeof validatedInputParamHeaderType
  | typeof validatedInputParamParamType;

export function buildCompositeValidationHandler<
  TOpenApiObject,
  TValidationCacheEntry,
>(handlers: {
  [TKey in ValidatedInputParamType]?: ValidationHandler<
    TOpenApiObject,
    ValidationInputParam & { type: TKey },
    TValidationCacheEntry
  >;
}) {
  return (
    ajv: Ajv,
    openApiObject: TOpenApiObject,
    validationContext: OpenApiValidationContext,
    inputParam: unknown,
    getEntry: (path: string, method: string) => TValidationCacheEntry,
  ): unknown => {
    if (inputParam === null || typeof inputParam !== 'object') {
      return inputParam;
    }

    const discriminatorValue: unknown = (
      inputParam as Partial<ValidationInputParam>
    ).type;

    const handler:
      | ValidationHandler<
          TOpenApiObject,
          ValidationInputParam,
          TValidationCacheEntry
        >
      | undefined = handlers[discriminatorValue as ValidatedInputParamType] as
      | ValidationHandler<
          TOpenApiObject,
          ValidationInputParam,
          TValidationCacheEntry
        >
      | undefined;

    if (handler === undefined) {
      return inputParam;
    }
    return handler(
      ajv,
      openApiObject,
      validationContext,
      inputParam as ValidationInputParam,
      getEntry,
    );
  };
}
