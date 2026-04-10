import type Ajv from 'ajv';

import { type ValidationInputParam } from './ValidatedDecoratorResult.js';

export type ValidationHandler<
  TOpenApiObject,
  TValidatedDecoratorResult extends ValidationInputParam,
  TValidationCacheEntry,
> = (
  ajv: Ajv,
  openApiObject: TOpenApiObject,
  inputParam: TValidatedDecoratorResult,
  getEntry: (path: string, method: string) => TValidationCacheEntry,
) => unknown;
