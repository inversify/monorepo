import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot2/controllerOpenApiMetadataReflectKey.js';
import { type ControllerOpenApiMetadata } from '../../models/v3Dot2/ControllerOpenApiMetadata.js';

export function getControllerOpenApiMetadata(
  target: object,
): ControllerOpenApiMetadata | undefined {
  return getOwnReflectMetadata<ControllerOpenApiMetadata>(
    target,
    controllerOpenApiMetadataReflectKey,
  );
}
