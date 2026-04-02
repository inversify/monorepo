import {
  type OpenApi3Dot2ParameterObject,
  type OpenApi3Dot2ReferenceObject,
} from '@inversifyjs/open-api-types/v3Dot2';
import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot2/controllerOpenApiMetadataReflectKey.js';
import { toSchemaInControllerOpenApiMetadataContext } from '../../actions/v3Dot2/toSchemaInControllerMetadataContext.js';
import { updateControllerOpenApiMetadataOperationArrayProperty } from '../../actions/v3Dot2/updateControllerOpenApiMetadataOperationArrayProperty.js';
import { buildDefaultControllerOpenApiMetadata } from '../../calculations/v3Dot2/buildDefaultControllerOpenApiMetadata.js';
import { type BuildOpenApiBlockFunction } from '../../models/v3Dot2/BuildOpenApiBlockFunction.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function OasParameter(
  parameter:
    | OpenApi3Dot2ParameterObject
    | OpenApi3Dot2ReferenceObject
    | BuildOpenApiBlockFunction<
        OpenApi3Dot2ParameterObject | OpenApi3Dot2ReferenceObject
      >,
): MethodDecorator {
  return (target: object, key: string | symbol): void => {
    const parameterResult:
      | OpenApi3Dot2ParameterObject
      | OpenApi3Dot2ReferenceObject =
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
