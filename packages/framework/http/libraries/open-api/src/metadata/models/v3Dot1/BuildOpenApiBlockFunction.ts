import { type ToSchemaFunction } from './ToSchemaFunction.js';

export type BuildOpenApiBlockFunction<TBlock> = (
  toSchema: ToSchemaFunction,
) => TBlock;
