import { ToSchemaFunction } from './ToSchemaFunction';

export type BuildOpenApiBlockFunction<TBlock> = (
  toSchema: ToSchemaFunction,
) => TBlock;
