import { type OpenApi3Dot2SchemaObject } from '@inversifyjs/open-api-types/v3Dot2';

import { type OpenApiSchemaMetadata } from '../../models/v3Dot2/OpenApiSchemaMetadata.js';

export function updateSchemaMetadataProperty(
  propertyKey: string,
  required: boolean,
  schema: OpenApi3Dot2SchemaObject | undefined,
): (metadata: OpenApiSchemaMetadata) => OpenApiSchemaMetadata {
  return (metadata: OpenApiSchemaMetadata) => {
    metadata.properties.set(propertyKey, {
      required,
      schema,
    });

    return metadata;
  };
}
