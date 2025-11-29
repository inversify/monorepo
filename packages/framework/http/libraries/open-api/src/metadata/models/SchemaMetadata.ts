import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

import { ReferencedSchemaMetadata } from './ReferencedSchemaMetadata';
import { SchemaPropertyMetadata } from './SchemaPropertyMetadata';
import { SchemaReferencesMetadata } from './SchemaReferencesMetadata';

export interface SchemaMetadata
  extends ReferencedSchemaMetadata, SchemaReferencesMetadata {
  customAttributes: OpenApi3Dot1SchemaObject | undefined;
  name: string | undefined;
  properties: Map<string, SchemaPropertyMetadata>;
}
