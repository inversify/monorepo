import { type OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

import { type OpenApiSchemaMetadata } from '../../models/v3Dot1/OpenApiSchemaMetadata.js';

export function updateSchemaMetadataSchema(
  schema: OpenApi3Dot1SchemaObject | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
): (metadata: OpenApiSchemaMetadata) => OpenApiSchemaMetadata {
  return (metadata: OpenApiSchemaMetadata): OpenApiSchemaMetadata => {
    if (metadata.schema !== undefined) {
      throw new Error(`Cannot redefine "${target.name}" schema`);
    }

    metadata.schema = schema;

    return metadata;
  };
}
