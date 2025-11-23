import { setReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodUseNativeHandlerMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodUseNativeHandlerMetadataReflectKey';

export function setControllerMethodUseNativeHandlerMetadata(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  controllerConstructor: Function,
  methodName: string | symbol,
): void {
  setReflectMetadata(
    controllerConstructor,
    controllerMethodUseNativeHandlerMetadataReflectKey,
    true,
    methodName,
  );
}
