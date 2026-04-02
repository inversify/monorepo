import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot2/controllerOpenApiMetadataReflectKey.js';
import { updateControllerOpenApiMetadataSummary } from '../../actions/v3Dot2/updateControllerOpenApiMetadataSummary.js';
import { buildDefaultControllerOpenApiMetadata } from '../../calculations/v3Dot2/buildDefaultControllerOpenApiMetadata.js';
import { type ControllerOpenApiMetadata } from '../../models/v3Dot2/ControllerOpenApiMetadata.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function OasSummary(summary: string): ClassDecorator & MethodDecorator {
  return (target: object, key?: string | symbol): void => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const typeTarget: Function =
      typeof target === 'function' ? target : target.constructor;

    updateOwnReflectMetadata<ControllerOpenApiMetadata>(
      typeTarget,
      controllerOpenApiMetadataReflectKey,
      buildDefaultControllerOpenApiMetadata,
      updateControllerOpenApiMetadataSummary(summary, typeTarget, key),
    );
  };
}
