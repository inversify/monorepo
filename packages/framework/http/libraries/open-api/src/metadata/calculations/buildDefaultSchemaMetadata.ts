import { type SchemaMetadata } from '../models/SchemaMetadata.js';

export function buildDefaultSchemaMetadata(): SchemaMetadata {
  return {
    customAttributes: undefined,
    name: undefined,
    properties: new Map(),
    references: new Set(),
    schema: undefined,
  };
}
