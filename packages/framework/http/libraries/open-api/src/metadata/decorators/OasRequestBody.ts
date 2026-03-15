import {
  type OpenApi3Dot1ReferenceObject,
  type OpenApi3Dot1RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey.js';
import { toSchemaInControllerOpenApiMetadataContext } from '../actions/toSchemaInControllerMetadataContext.js';
import { updateControllerOpenApiMetadataOperationProperty } from '../actions/updateControllerOpenApiMetadataOperationProperty.js';
import { buildDefaultControllerOpenApiMetadata } from '../calculations/buildDefaultControllerOpenApiMetadata.js';
import { type BuildOpenApiBlockFunction } from '../models/BuildOpenApiBlockFunction.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function OasRequestBody(
  requestBody:
    | OpenApi3Dot1RequestBodyObject
    | OpenApi3Dot1ReferenceObject
    | BuildOpenApiBlockFunction<
        OpenApi3Dot1RequestBodyObject | OpenApi3Dot1ReferenceObject
      >,
): MethodDecorator {
  return (target: object, key: string | symbol): void => {
    const requestBodyResult:
      | OpenApi3Dot1RequestBodyObject
      | OpenApi3Dot1ReferenceObject =
      typeof requestBody === 'function'
        ? requestBody(
            toSchemaInControllerOpenApiMetadataContext(target.constructor),
          )
        : requestBody;

    updateOwnReflectMetadata(
      target.constructor,
      controllerOpenApiMetadataReflectKey,
      buildDefaultControllerOpenApiMetadata,
      updateControllerOpenApiMetadataOperationProperty(
        requestBodyResult,
        target.constructor,
        key,
        'requestBody',
      ),
    );
  };
}
