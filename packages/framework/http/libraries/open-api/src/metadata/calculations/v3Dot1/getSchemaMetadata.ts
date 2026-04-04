import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { schemaOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot1/schemaOpenApiMetadataReflectKey.js';
import { type OpenApiSchemaMetadata } from '../../models/v3Dot1/OpenApiSchemaMetadata.js';
import { buildDefaultSchemaMetadata } from './buildDefaultSchemaMetadata.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function getSchemaMetadata(type: Function): OpenApiSchemaMetadata {
  return (
    getOwnReflectMetadata<OpenApiSchemaMetadata>(
      type,
      schemaOpenApiMetadataReflectKey,
    ) ?? buildDefaultSchemaMetadata()
  );
}
