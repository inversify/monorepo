import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey.js';
import { updateControllerOpenApiMetadataOperationProperty } from '../actions/updateControllerOpenApiMetadataOperationProperty.js';
import { buildDefaultControllerOpenApiMetadata } from '../calculations/buildDefaultControllerOpenApiMetadata.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function OasOperationId(content: string): MethodDecorator {
  return (target: object, key: string | symbol): void => {
    updateOwnReflectMetadata(
      target.constructor,
      controllerOpenApiMetadataReflectKey,
      buildDefaultControllerOpenApiMetadata,
      updateControllerOpenApiMetadataOperationProperty(
        content,
        target.constructor,
        key,
        'operationId',
      ),
    );
  };
}
