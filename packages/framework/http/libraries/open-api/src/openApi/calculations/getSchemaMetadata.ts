import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { buildDefaultSchemaMetadata } from '../../metadata/calculations/buildDefaultSchemaMetadata.js';
import { type SchemaMetadata } from '../../metadata/models/SchemaMetadata.js';
import { schemaOpenApiMetadataReflectKey } from '../../reflectMetadata/data/schemaOpenApiMetadataReflectKey.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function getSchemaMetadata(type: Function): SchemaMetadata {
  return (
    getOwnReflectMetadata<SchemaMetadata>(
      type,
      schemaOpenApiMetadataReflectKey,
    ) ?? buildDefaultSchemaMetadata()
  );
}
