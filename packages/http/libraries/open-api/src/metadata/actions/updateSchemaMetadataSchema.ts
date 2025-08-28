import { OpenApi3Dot1SchemaObject } from '@inversifyjs/open-api-types/v3Dot1';

import { SchemaMetadata } from '../models/SchemaMetadata';

export function updateSchemaMetadataSchema(
  schema: OpenApi3Dot1SchemaObject | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
): (metadata: SchemaMetadata) => SchemaMetadata {
  return (metadata: SchemaMetadata): SchemaMetadata => {
    if (metadata.schema !== undefined) {
      throw new Error(`Cannot redefine "${target.name}" schema`);
    }

    metadata.schema = schema;

    return metadata;
  };
}
