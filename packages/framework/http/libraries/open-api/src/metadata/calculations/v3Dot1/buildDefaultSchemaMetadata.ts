import { type OpenApiSchemaMetadata } from '../../models/v3Dot1/OpenApiSchemaMetadata.js';

export function buildDefaultSchemaMetadata(): OpenApiSchemaMetadata {
  return {
    customAttributes: undefined,
    name: undefined,
    properties: new Map(),
    references: new Set(),
    schema: undefined,
  };
}
