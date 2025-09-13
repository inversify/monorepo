import { OpenApi3Dot1SecurityRequirementObject } from '@inversifyjs/open-api-types/v3Dot1';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey';
import { updateControllerOpenApiMetadataOperationArrayProperty } from '../actions/updateControllerOpenApiMetadataOperationArrayProperty';
import { buildDefaultControllerOpenApiMetadata } from '../calculations/buildDefaultControllerOpenApiMetadata';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function OasSecurity(
  content: OpenApi3Dot1SecurityRequirementObject,
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
