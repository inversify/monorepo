import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { schemaOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot1/schemaOpenApiMetadataReflectKey.js';
import { buildDefaultSchemaMetadata } from '../../calculations/v3Dot1/buildDefaultSchemaMetadata.js';
import { type ToSchemaFunction } from '../../models/v3Dot1/ToSchemaFunction.js';
import { updateSchemaMetadataReferences } from '../updateSchemaMetadataReferences.js';
import { toSchema } from './toSchema.js';

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
