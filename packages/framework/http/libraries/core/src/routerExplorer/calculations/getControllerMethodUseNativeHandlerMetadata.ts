import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { controllerMethodUseNativeHandlerMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodUseNativeHandlerMetadataReflectKey';

export function getControllerMethodUseNativeHandlerMetadata(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
): boolean {
  return (
    getOwnReflectMetadata(
      controllerConstructor,
      controllerMethodUseNativeHandlerMetadataReflectKey,
      methodKey,
    ) ?? false
  );
}
