import type Ajv from 'ajv';

import { type ValidationInputParam } from './ValidatedDecoratorResult.js';

export type ValidationHandler<
  in TOpenApiObject,
  in TValidatedDecoratorResult extends ValidationInputParam,
> = (
  ajv: Ajv,
  openApiObject: TOpenApiObject,
  inputParam: TValidatedDecoratorResult,
) => unknown;
