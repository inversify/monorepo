import { HttpStatusCode } from '@inversifyjs/http-core';
import { OpenApi3Dot1ResponseObject } from '@inversifyjs/open-api-types/v3Dot1';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey';
import { updateControllerOpenApiMetadataOperationRecordProperty } from '../actions/updateControllerOpenApiMetadataOperationRecordProperty';
import { buildDefaultControllerOpenApiMetadata } from '../calculations/buildDefaultControllerOpenApiMetadata';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function Response(
  code: HttpStatusCode,
  response: OpenApi3Dot1ResponseObject,
): MethodDecorator {
  return (target: object, key: string | symbol): void => {
    updateOwnReflectMetadata(
      target.constructor,
      controllerOpenApiMetadataReflectKey,
      buildDefaultControllerOpenApiMetadata,
      updateControllerOpenApiMetadataOperationRecordProperty(
        code.toString(),
        response,
        target.constructor,
        key,
        'responses',
      ),
    );
  };
}
