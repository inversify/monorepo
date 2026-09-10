import { type SourceImport } from './BootstrapSourceModel.js';

interface ProvideOpenApiComponentSchemaSourceModel {
  identifier: string;
  name: string;
}

export interface ProvideOpenApiSourceModel {
  componentSchemas: readonly ProvideOpenApiComponentSchemaSourceModel[];
  schemaImports: readonly SourceImport[];
}
