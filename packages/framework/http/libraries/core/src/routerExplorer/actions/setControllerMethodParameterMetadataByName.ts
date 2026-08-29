import { setReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodParameterMetadataByNameReflectKey } from '../../reflectMetadata/data/controllerMethodParameterMetadataByNameReflectKey.js';
import { type ControllerMethodParameterMetadata } from '../model/ControllerMethodParameterMetadata.js';

export function setControllerMethodParameterMetadataByName(
  paramMap: Record<string, ControllerMethodParameterMetadata>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  controllerConstructor: Function,
  methodName: string | symbol,
): void {
  setReflectMetadata(
    controllerConstructor,
    controllerMethodParameterMetadataByNameReflectKey,
    paramMap,
    methodName,
  );
}
