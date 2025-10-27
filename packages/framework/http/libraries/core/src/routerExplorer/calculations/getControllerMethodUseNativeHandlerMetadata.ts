import { findInPrototypeChain } from '@inversifyjs/prototype-utils';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import type { Newable } from 'inversify';

import { controllerMethodUseNativeHandlerMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodUseNativeHandlerMetadataReflectKey';

export function getControllerMethodUseNativeHandlerMetadata(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
): boolean {
  return (
    findInPrototypeChain<boolean>(
      controllerConstructor as Newable,
      (type: Newable): boolean | undefined =>
        getOwnReflectMetadata(
          type,
          controllerMethodUseNativeHandlerMetadataReflectKey,
          methodKey,
        ),
    ) ?? false
  );
}
