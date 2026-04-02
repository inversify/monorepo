import { type OpenApi3Dot2ServerObject } from '@inversifyjs/open-api-types/v3Dot2';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot2/controllerOpenApiMetadataReflectKey.js';
import { updateControllerOpenApiMetadataServer } from '../../actions/v3Dot2/updateControllerOpenApiMetadataServer.js';
import { buildDefaultControllerOpenApiMetadata } from '../../calculations/v3Dot2/buildDefaultControllerOpenApiMetadata.js';
import { type ControllerOpenApiMetadata } from '../../models/v3Dot2/ControllerOpenApiMetadata.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function OasServer(
  server: OpenApi3Dot2ServerObject,
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
