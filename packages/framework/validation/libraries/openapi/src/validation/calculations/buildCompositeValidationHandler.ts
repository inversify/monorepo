import type Ajv from 'ajv';

import { type ValidationInputParam } from '../models/ValidatedDecoratorResult.js';
import { type ValidationHandler } from '../models/ValidationHandler.js';
import { type OpenApiResolver } from '../services/OpenApiResolver.js';

type DiscriminatorValidationHandlerPair<
  TDiscriminatorValue extends symbol,
  TOpenApiObject,
  TValidatedDecoratorResult extends ValidationInputParam & {
    type: TDiscriminatorValue;
  },
  TValidationCacheEntry,
> = [
  TDiscriminatorValue,
  ValidationHandler<
    TOpenApiObject,
    TValidatedDecoratorResult,
    TValidationCacheEntry
  >,
];

export function buildCompositeValidationHandler<
  TOpenApiObject,
  TValidationCacheEntry,
>(
  discriminatorHandlerPairs: DiscriminatorValidationHandlerPair<
    symbol,
    TOpenApiObject,
    ValidationInputParam,
    TValidationCacheEntry
  >[],
) {
  const handlerMap: Map<
    symbol,
    ValidationHandler<
      TOpenApiObject,
      ValidationInputParam,
      TValidationCacheEntry
    >
  > = new Map(discriminatorHandlerPairs);

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
      | undefined = handlerMap.get(discriminatorValue as symbol);
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
