import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

import { SchemaMetadata } from '../models/SchemaMetadata';

export function updateSchemaMetadataProperty(
  propertyKey: string,
  required: boolean,
  schema: OpenApi3Dot1SchemaObject | undefined,
): (metadata: SchemaMetadata) => SchemaMetadata {
  return (metadata: SchemaMetadata) => {
    metadata.properties.set(propertyKey, {
      required,
      schema,
    });

    return metadata;
  };
}
