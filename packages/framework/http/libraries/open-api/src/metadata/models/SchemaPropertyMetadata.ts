import { type ReferencedSchemaMetadata } from './ReferencedSchemaMetadata.js';

export interface SchemaPropertyMetadata extends ReferencedSchemaMetadata {
  required: boolean;
}
