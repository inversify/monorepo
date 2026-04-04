import { type OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

import { type OpenApiSchemaMetadata } from '../../models/v3Dot1/OpenApiSchemaMetadata.js';

export function updateSchemaMetadataProperty(
  propertyKey: string,
  required: boolean,
  schema: OpenApi3Dot1SchemaObject | undefined,
): (metadata: OpenApiSchemaMetadata) => OpenApiSchemaMetadata {
  return (metadata: OpenApiSchemaMetadata) => {
    metadata.properties.set(propertyKey, {
      required,
      schema,
    });

    return metadata;
  };
}
