import {
  buildArrayMetadataWithIndex,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodParameterMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodParameterMetadataReflectKey.js';
import { type ControllerMethodParameterMetadata } from '../model/ControllerMethodParameterMetadata.js';

export function setControllerMethodParameterMetadata(
  controllerMethodParameterMetadata: ControllerMethodParameterMetadata,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  controllerConstructor: Function,
  methodName: string | symbol,
  parameterIndex: number,
): void {
  updateOwnReflectMetadata(
    controllerConstructor,
    controllerMethodParameterMetadataReflectKey,
    buildEmptyArrayMetadata,
    buildArrayMetadataWithIndex(
      controllerMethodParameterMetadata,
      parameterIndex,
    ),
    methodName,
  );
}
