import type Ajv from 'ajv';

import { type ValidationInputParam } from '../models/ValidatedDecoratorResult.js';
import { type ValidationHandler } from '../models/ValidationHandler.js';

type DiscriminatorValidationHandlerPair<
  TDiscriminatorValue extends symbol,
  TOpenApiObject,
  TValidatedDecoratorResult extends ValidationInputParam & {
    type: TDiscriminatorValue;
  },
> = [
  TDiscriminatorValue,
  ValidationHandler<TOpenApiObject, TValidatedDecoratorResult>,
];

export function buildCompositeValidationHandler<TOpenApiObject>(
  discriminatorHandlerPairs: DiscriminatorValidationHandlerPair<
    symbol,
    TOpenApiObject,
    ValidationInputParam
  >[],
) {
  const handlerMap: Map<
    symbol,
    ValidationHandler<TOpenApiObject, ValidationInputParam>
  > = new Map(discriminatorHandlerPairs);

  return (
    ajv: Ajv,
    openApiObject: TOpenApiObject,
    inputParam: unknown,
  ): unknown => {
    if (inputParam === null || typeof inputParam !== 'object') {
      return inputParam;
    }

    const discriminatorValue: unknown = (
      inputParam as Partial<ValidationInputParam>
    ).type;

    const handler:
      | ValidationHandler<TOpenApiObject, ValidationInputParam>
      | undefined = handlerMap.get(discriminatorValue as symbol);
    if (handler === undefined) {
      return inputParam;
    }
    return handler(ajv, openApiObject, inputParam as ValidationInputParam);
  };
}
