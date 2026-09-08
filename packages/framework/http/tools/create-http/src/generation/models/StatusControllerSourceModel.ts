import { type SourceImport } from './BootstrapSourceModel.js';
import { type OpenApiSchemaBindingKind } from './OpenApiSchemaBindingKind.js';

export interface StatusControllerSourceModel {
  apiTypeImport: SourceImport;
  openApiSchemaBindingKind: OpenApiSchemaBindingKind;
}
