import { OpenApi3Dot1ServerObject } from '@inversifyjs/open-api-types/v3Dot1';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey';
import { updateControllerOpenApiMetadataServer } from '../actions/updateControllerOpenApiMetadataServer';
import { buildDefaultControllerOpenApiMetadata } from '../calculations/buildDefaultControllerOpenApiMetadata';
import { ControllerOpenApiMetadata } from '../models/ControllerOpenApiMetadata';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function OasServer(
  server: OpenApi3Dot1ServerObject,
): ClassDecorator & MethodDecorator {
  return (target: object, key?: string | symbol): void => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const typeTarget: Function =
      typeof target === 'function' ? target : target.constructor;

    updateOwnReflectMetadata<ControllerOpenApiMetadata>(
      typeTarget,
      controllerOpenApiMetadataReflectKey,
      buildDefaultControllerOpenApiMetadata,
      updateControllerOpenApiMetadataServer(server, key),
    );
  };
}
