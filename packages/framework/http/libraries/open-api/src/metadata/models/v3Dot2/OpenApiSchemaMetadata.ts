import { type OpenApi3Dot2SchemaObject } from '@inversifyjs/open-api-types/v3Dot2';

import { type SchemaReferencesMetadata } from '../SchemaReferencesMetadata.js';
import { type OpenApiSchemaPropertyMetadata } from './OpenApiSchemaPropertyMetadata.js';
import { type ReferencedOpenApiSchemaMetadata } from './ReferencedOpenApiSchemaMetadata.js';

export interface OpenApiSchemaMetadata
  extends ReferencedOpenApiSchemaMetadata, SchemaReferencesMetadata {
  customAttributes: OpenApi3Dot2SchemaObject | undefined;
  name: string | undefined;
  properties: Map<string, OpenApiSchemaPropertyMetadata>;
}
