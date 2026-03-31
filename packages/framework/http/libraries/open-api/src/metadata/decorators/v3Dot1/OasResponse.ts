import { type HttpStatusCode } from '@inversifyjs/http-core';
import { type OpenApi3Dot1ResponseObject } from '@inversifyjs/open-api-types/v3Dot1';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/controllerOpenApiMetadataReflectKey.js';
import { toSchemaInControllerOpenApiMetadataContext } from '../../actions/v3Dot1/toSchemaInControllerMetadataContext.js';
import { updateControllerOpenApiMetadataOperationRecordProperty } from '../../actions/v3Dot1/updateControllerOpenApiMetadataOperationRecordProperty.js';
import { buildDefaultControllerOpenApiMetadata } from '../../calculations/v3Dot1/buildDefaultControllerOpenApiMetadata.js';
import { type BuildOpenApiBlockFunction } from '../../models/v3Dot1/BuildOpenApiBlockFunction.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function OasResponse(
  code: HttpStatusCode,
  response:
    | OpenApi3Dot1ResponseObject
    | BuildOpenApiBlockFunction<OpenApi3Dot1ResponseObject>,
): MethodDecorator {
  return (target: object, key: string | symbol): void => {
    const responseResult: OpenApi3Dot1ResponseObject =
      typeof response === 'function'
        ? response(
            toSchemaInControllerOpenApiMetadataContext(target.constructor),
          )
        : response;

    updateOwnReflectMetadata(
      target.constructor,
      controllerOpenApiMetadataReflectKey,
      buildDefaultControllerOpenApiMetadata,
      updateControllerOpenApiMetadataOperationRecordProperty(
        code.toString(),
        responseResult,
        target.constructor,
        key,
        'responses',
      ),
    );
  };
}
