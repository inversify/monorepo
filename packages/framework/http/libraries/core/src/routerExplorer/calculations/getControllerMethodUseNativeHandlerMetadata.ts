import { getBaseType } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import type { Newable } from 'inversify';

import { controllerMethodUseNativeHandlerMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodUseNativeHandlerMetadataReflectKey';

export function getControllerMethodUseNativeHandlerMetadata(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
): boolean {
  let currentType: Newable | undefined = controllerConstructor as Newable;

  while (currentType !== undefined) {
    const useNativeHandler: boolean | undefined = getOwnReflectMetadata(
      currentType,
      controllerMethodUseNativeHandlerMetadataReflectKey,
      methodKey,
    );

    if (useNativeHandler !== undefined) {
      return useNativeHandler;
    }

    currentType = getBaseType(currentType);
  }

  return false;
}
