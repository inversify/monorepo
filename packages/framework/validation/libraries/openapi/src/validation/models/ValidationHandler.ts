import type Ajv from 'ajv';

import { type OpenApiResolver } from '../services/OpenApiResolver.js';
import { type ValidationInputParam } from './ValidatedDecoratorResult.js';

export type ValidationHandler<
  TOpenApiObject,
  TValidatedDecoratorResult extends ValidationInputParam,
  TValidationCacheEntry,
> = (
  ajv: Ajv,
  openApiObject: TOpenApiObject,
  openApiResolver: OpenApiResolver,
  inputParam: TValidatedDecoratorResult,
  getEntry: (path: string, method: string) => TValidationCacheEntry,
) => unknown;
