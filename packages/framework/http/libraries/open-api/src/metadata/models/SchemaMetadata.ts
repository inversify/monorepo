import { ReferencedSchemaMetadata } from './ReferencedSchemaMetadata';
import { SchemaPropertyMetadata } from './SchemaPropertyMetadata';
import { SchemaReferencesMetadata } from './SchemaReferencesMetadata';

export interface SchemaMetadata
  extends ReferencedSchemaMetadata,
    SchemaReferencesMetadata {
  name: string | undefined;
  properties: Map<string, SchemaPropertyMetadata>;
}
