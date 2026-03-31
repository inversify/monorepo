import { type ReferencedOpenApiSchemaMetadata } from './ReferencedOpenApiSchemaMetadata.js';

export interface OpenApiSchemaPropertyMetadata extends ReferencedOpenApiSchemaMetadata {
  required: boolean;
}
