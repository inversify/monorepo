import { type OpenApiSchemaMetadata } from '../../models/v3Dot2/OpenApiSchemaMetadata.js';

export function buildDefaultSchemaMetadata(): OpenApiSchemaMetadata {
  return {
    customAttributes: undefined,
    name: undefined,
    properties: new Map(),
    references: new Set(),
    schema: undefined,
  };
}
