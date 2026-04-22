import type Ajv from 'ajv';

import { type OpenApiValidationContext } from './OpenApiValidationContext.js';
import { type ValidationInputParam } from './ValidatedDecoratorResult.js';

export type ValidationHandler<
  TOpenApiObject,
  TValidatedDecoratorResult extends ValidationInputParam,
  TValidationCacheEntry,
> = (
  ajv: Ajv,
  openApiObject: TOpenApiObject,
  validationContext: OpenApiValidationContext,
  inputParam: TValidatedDecoratorResult,
  getEntry: (path: string, method: string) => TValidationCacheEntry,
) => unknown;
