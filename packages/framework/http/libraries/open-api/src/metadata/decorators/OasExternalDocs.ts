import { OpenApi3Dot1ExternalDocumentationObject } from '@inversifyjs/open-api-types/v3Dot1';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey';
import { updateControllerOpenApiMetadataOperationProperty } from '../actions/updateControllerOpenApiMetadataOperationProperty';
import { buildDefaultControllerOpenApiMetadata } from '../calculations/buildDefaultControllerOpenApiMetadata';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function OasExternalDocs(
  content: OpenApi3Dot1ExternalDocumentationObject,
): MethodDecorator {
  return (target: object, key: string | symbol): void => {
    updateOwnReflectMetadata(
      target.constructor,
      controllerOpenApiMetadataReflectKey,
      buildDefaultControllerOpenApiMetadata,
      updateControllerOpenApiMetadataOperationProperty(
        content,
        target.constructor,
        key,
        'externalDocs',
      ),
    );
  };
}
