import { type OpenApi3Dot2SecurityRequirementObject } from '@inversifyjs/open-api-types/v3Dot2';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot2/controllerOpenApiMetadataReflectKey.js';
import { updateControllerOpenApiMetadataOperationArrayProperty } from '../../actions/v3Dot2/updateControllerOpenApiMetadataOperationArrayProperty.js';
import { buildDefaultControllerOpenApiMetadata } from '../../calculations/v3Dot2/buildDefaultControllerOpenApiMetadata.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function OasSecurity(
  content: OpenApi3Dot2SecurityRequirementObject,
): MethodDecorator {
  return (target: object, key: string | symbol): void => {
    updateOwnReflectMetadata(
      target.constructor,
      controllerOpenApiMetadataReflectKey,
      buildDefaultControllerOpenApiMetadata,
      updateControllerOpenApiMetadataOperationArrayProperty(
        content,
        key,
        'security',
      ),
    );
  };
}
