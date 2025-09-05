import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { buildDefaultSchemaMetadata } from '../../metadata/calculations/buildDefaultSchemaMetadata';
import { SchemaMetadata } from '../../metadata/models/SchemaMetadata';
import { schemaOpenApiMetadataReflectKey } from '../../reflectMetadata/data/schemaOpenApiMetadataReflectKey';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function getSchemaMetadata(type: Function): SchemaMetadata {
  return (
    getOwnReflectMetadata<SchemaMetadata>(
      type,
      schemaOpenApiMetadataReflectKey,
    ) ?? buildDefaultSchemaMetadata()
  );
}
