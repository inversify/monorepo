import { type OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

import { type ReferencedSchemaMetadata } from './ReferencedSchemaMetadata.js';
import { type SchemaPropertyMetadata } from './SchemaPropertyMetadata.js';
import { type SchemaReferencesMetadata } from './SchemaReferencesMetadata.js';

export interface SchemaMetadata
  extends ReferencedSchemaMetadata, SchemaReferencesMetadata {
  customAttributes: OpenApi3Dot1SchemaObject | undefined;
  name: string | undefined;
  properties: Map<string, SchemaPropertyMetadata>;
}
