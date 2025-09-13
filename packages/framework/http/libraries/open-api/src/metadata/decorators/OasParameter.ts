import {
  OpenApi3Dot1ParameterObject,
  OpenApi3Dot1ReferenceObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey';
import { toSchemaInControllerOpenApiMetadataContext } from '../actions/toSchemaInControllerMetadataContext';
import { updateControllerOpenApiMetadataOperationArrayProperty } from '../actions/updateControllerOpenApiMetadataOperationArrayProperty';
import { buildDefaultControllerOpenApiMetadata } from '../calculations/buildDefaultControllerOpenApiMetadata';
import { BuildOpenApiBlockFunction } from '../models/BuildOpenApiBlockFunction';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function OasParameter(
  parameter:
    | OpenApi3Dot1ParameterObject
    | OpenApi3Dot1ReferenceObject
    | BuildOpenApiBlockFunction<
        OpenApi3Dot1ParameterObject | OpenApi3Dot1ReferenceObject
      >,
): MethodDecorator {
  return (target: object, key: string | symbol): void => {
    const parameterResult:
      | OpenApi3Dot1ParameterObject
      | OpenApi3Dot1ReferenceObject =
      typeof parameter === 'function'
        ? parameter(
            toSchemaInControllerOpenApiMetadataContext(target.constructor),
          )
        : parameter;

    updateOwnReflectMetadata(
      target.constructor,
      controllerOpenApiMetadataReflectKey,
      buildDefaultControllerOpenApiMetadata,
      updateControllerOpenApiMetadataOperationArrayProperty(
        parameterResult,
        key,
        'parameters',
      ),
    );
  };
}
