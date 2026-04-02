import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot2/controllerOpenApiMetadataReflectKey.js';
import { updateControllerOpenApiMetadataOperationProperty } from '../../actions/v3Dot2/updateControllerOpenApiMetadataOperationProperty.js';
import { buildDefaultControllerOpenApiMetadata } from '../../calculations/v3Dot2/buildDefaultControllerOpenApiMetadata.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function OasDescription(content: string): MethodDecorator {
  return (target: object, key: string | symbol): void => {
    updateOwnReflectMetadata(
      target.constructor,
      controllerOpenApiMetadataReflectKey,
      buildDefaultControllerOpenApiMetadata,
      updateControllerOpenApiMetadataOperationProperty(
        content,
        target.constructor,
        key,
        'description',
      ),
    );
  };
}
