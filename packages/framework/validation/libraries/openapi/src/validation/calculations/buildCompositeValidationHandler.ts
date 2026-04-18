import type Ajv from 'ajv';

import { type ValidationInputParam } from '../models/ValidatedDecoratorResult.js';
import {
  type validatedInputParamBodyType,
  type validatedInputParamHeaderType,
} from '../models/validatedInputParamTypes.js';
import { type ValidationHandler } from '../models/ValidationHandler.js';
import { type OpenApiResolver } from '../services/OpenApiResolver.js';

type ValidatedInputParamType =
  | typeof validatedInputParamBodyType
  | typeof validatedInputParamHeaderType;

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
    openApiResolver: OpenApiResolver,
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
      openApiResolver,
      inputParam as ValidationInputParam,
      getEntry,
    );
  };
}
