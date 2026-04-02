import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot2/controllerOpenApiMetadataReflectKey.js';
import { buildDefaultControllerOpenApiMetadata } from '../../calculations/v3Dot2/buildDefaultControllerOpenApiMetadata.js';
import { type ToSchemaFunction } from '../../models/v3Dot2/ToSchemaFunction.js';
import { updateSchemaMetadataReferences } from '../updateSchemaMetadataReferences.js';
import { toSchema } from './toSchema.js';

export function toSchemaInControllerOpenApiMetadataContext(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  target: Function,
): ToSchemaFunction {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return toSchema((type: Function): void => {
    updateOwnReflectMetadata(
      target,
      controllerOpenApiMetadataReflectKey,
      buildDefaultControllerOpenApiMetadata,
      updateSchemaMetadataReferences(type),
    );
  });
}
