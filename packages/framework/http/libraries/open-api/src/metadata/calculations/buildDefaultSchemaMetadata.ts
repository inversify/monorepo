import { SchemaMetadata } from '../models/SchemaMetadata';

export function buildDefaultSchemaMetadata(): SchemaMetadata {
  return {
    customAttributes: undefined,
    name: undefined,
    properties: new Map(),
    references: new Set(),
    schema: undefined,
  };
}
