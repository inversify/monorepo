import {
  type OpenApi3Dot1ParameterObject,
  type OpenApi3Dot1ReferenceObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot1/controllerOpenApiMetadataReflectKey.js';
import { toSchemaInControllerOpenApiMetadataContext } from '../../actions/v3Dot1/toSchemaInControllerMetadataContext.js';
import { updateControllerOpenApiMetadataOperationArrayProperty } from '../../actions/v3Dot1/updateControllerOpenApiMetadataOperationArrayProperty.js';
import { buildDefaultControllerOpenApiMetadata } from '../../calculations/v3Dot1/buildDefaultControllerOpenApiMetadata.js';
import { type BuildOpenApiBlockFunction } from '../../models/v3Dot1/BuildOpenApiBlockFunction.js';

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const typeTarget: Function =
      typeof target === 'function' ? target : target.constructor;

    const parameterResult:
      | OpenApi3Dot1ParameterObject
      | OpenApi3Dot1ReferenceObject =
      typeof parameter === 'function'
        ? parameter(toSchemaInControllerOpenApiMetadataContext(typeTarget))
        : parameter;

    updateOwnReflectMetadata(
      typeTarget,
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
