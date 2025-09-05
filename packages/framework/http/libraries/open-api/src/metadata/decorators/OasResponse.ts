import { HttpStatusCode } from '@inversifyjs/http-core';
import { OpenApi3Dot1ResponseObject } from '@inversifyjs/open-api-types/v3Dot1';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey';
import { toSchemaInControllerOpenApiMetadataContext } from '../actions/toSchemaInControllerMetadataContext';
import { updateControllerOpenApiMetadataOperationRecordProperty } from '../actions/updateControllerOpenApiMetadataOperationRecordProperty';
import { buildDefaultControllerOpenApiMetadata } from '../calculations/buildDefaultControllerOpenApiMetadata';
import { BuildOpenApiBlockFunction } from '../models/BuildOpenApiBlockFunction';

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
