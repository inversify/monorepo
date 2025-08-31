import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey';
import { buildDefaultControllerOpenApiMetadata } from '../calculations/buildDefaultControllerOpenApiMetadata';
import { ToSchemaFunction } from '../models/ToSchemaFunction';
import { toSchema } from './toSchema';
import { updateSchemaMetadataReferences } from './updateSchemaMetadataReferences';

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
