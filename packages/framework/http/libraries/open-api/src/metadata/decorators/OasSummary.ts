import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey';
import { updateControllerOpenApiMetadataSummary } from '../actions/updateControllerOpenApiMetadataSummary';
import { buildDefaultControllerOpenApiMetadata } from '../calculations/buildDefaultControllerOpenApiMetadata';
import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';

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
