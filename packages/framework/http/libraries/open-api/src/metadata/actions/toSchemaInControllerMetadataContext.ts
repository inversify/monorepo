import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey.js';
import { buildDefaultControllerOpenApiMetadata } from '../calculations/buildDefaultControllerOpenApiMetadata.js';
import { type ToSchemaFunction } from '../models/ToSchemaFunction.js';
import { toSchema } from './toSchema.js';
import { updateSchemaMetadataReferences } from './updateSchemaMetadataReferences.js';

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
