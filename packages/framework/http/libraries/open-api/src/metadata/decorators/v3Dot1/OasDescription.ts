import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot1/controllerOpenApiMetadataReflectKey.js';
import { updateControllerOpenApiMetadataOperationProperty } from '../../actions/v3Dot1/updateControllerOpenApiMetadataOperationProperty.js';
import { buildDefaultControllerOpenApiMetadata } from '../../calculations/v3Dot1/buildDefaultControllerOpenApiMetadata.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function OasDescription(content: string): MethodDecorator {
  return (target: object, key: string | symbol): void => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const typeTarget: Function =
      typeof target === 'function' ? target : target.constructor;

    updateOwnReflectMetadata(
      typeTarget,
      controllerOpenApiMetadataReflectKey,
      buildDefaultControllerOpenApiMetadata,
      updateControllerOpenApiMetadataOperationProperty(
        content,
        typeTarget,
        key,
        'description',
      ),
    );
  };
}
