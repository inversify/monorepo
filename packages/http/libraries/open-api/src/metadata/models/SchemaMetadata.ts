import { ReferencedSchemaMetadata } from './ReferencedSchemaMetadata';

export interface SchemaMetadata extends ReferencedSchemaMetadata {
  name: string | undefined;
  properties: Map<string, ReferencedSchemaMetadata>;
}
