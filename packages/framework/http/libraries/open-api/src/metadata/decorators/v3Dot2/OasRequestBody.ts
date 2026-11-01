import {
  type OpenApi3Dot2ReferenceObject,
  type OpenApi3Dot2RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot2';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot2/controllerOpenApiMetadataReflectKey.js';
import { toSchemaInControllerOpenApiMetadataContext } from '../../actions/v3Dot2/toSchemaInControllerMetadataContext.js';
import { updateControllerOpenApiMetadataOperationProperty } from '../../actions/v3Dot2/updateControllerOpenApiMetadataOperationProperty.js';
import { buildDefaultControllerOpenApiMetadata } from '../../calculations/v3Dot2/buildDefaultControllerOpenApiMetadata.js';
import { type BuildOpenApiBlockFunction } from '../../models/v3Dot2/BuildOpenApiBlockFunction.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function OasRequestBody(
  requestBody:
    | OpenApi3Dot2RequestBodyObject
    | OpenApi3Dot2ReferenceObject
    | BuildOpenApiBlockFunction<
        OpenApi3Dot2RequestBodyObject | OpenApi3Dot2ReferenceObject
      >,
): MethodDecorator {
  return (target: object, key: string | symbol): void => {
    const requestBodyResult:
      | OpenApi3Dot2RequestBodyObject
      | OpenApi3Dot2ReferenceObject =
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
