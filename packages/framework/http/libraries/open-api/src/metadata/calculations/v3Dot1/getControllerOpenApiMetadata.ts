import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot1/controllerOpenApiMetadataReflectKey.js';
import { type ControllerOpenApiMetadata } from '../../models/v3Dot1/ControllerOpenApiMetadata.js';

export function getControllerOpenApiMetadata(
  target: object,
): ControllerOpenApiMetadata | undefined {
  return getOwnReflectMetadata<ControllerOpenApiMetadata>(
    target,
    controllerOpenApiMetadataReflectKey,
  );
}
