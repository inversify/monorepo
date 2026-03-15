import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { schemaOpenApiMetadataReflectKey } from '../../reflectMetadata/data/schemaOpenApiMetadataReflectKey.js';
import { buildDefaultSchemaMetadata } from '../calculations/buildDefaultSchemaMetadata.js';
import { type ToSchemaFunction } from '../models/ToSchemaFunction.js';
import { toSchema } from './toSchema.js';
import { updateSchemaMetadataReferences } from './updateSchemaMetadataReferences.js';

export function toSchemaInSchemaMetadataContext(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
): ToSchemaFunction {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return toSchema((type: Function): void => {
    updateOwnReflectMetadata(
      target,
      schemaOpenApiMetadataReflectKey,
      buildDefaultSchemaMetadata,
      updateSchemaMetadataReferences(type),
    );
  });
}
