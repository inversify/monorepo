import { type OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

import { type SchemaReferencesMetadata } from '../SchemaReferencesMetadata.js';
import { type OpenApiSchemaPropertyMetadata } from './OpenApiSchemaPropertyMetadata.js';
import { type ReferencedOpenApiSchemaMetadata } from './ReferencedOpenApiSchemaMetadata.js';

export interface OpenApiSchemaMetadata
  extends ReferencedOpenApiSchemaMetadata, SchemaReferencesMetadata {
  customAttributes: OpenApi3Dot1SchemaObject | undefined;
  name: string | undefined;
  properties: Map<string, OpenApiSchemaPropertyMetadata>;
}
