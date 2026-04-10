import { type ValidationInputParam } from './ValidatedDecoratorResult.js';
import { type ValidationHandler } from './ValidationHandler.js';

export type DiscriminatorValidationHandlerPair<
  TDiscriminatorValue extends symbol,
  TOpenApiObject,
  TValidatedDecoratorResult extends ValidationInputParam & {
    type: TDiscriminatorValue;
  },
  TValidationCacheEntry = unknown,
> = [
  TDiscriminatorValue,
  ValidationHandler<
    TOpenApiObject,
    TValidatedDecoratorResult,
    TValidationCacheEntry
  >,
];
