import {
  buildArrayMetadataWithArray,
  buildDefaultArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { controllerGuardMetadataReflectKey } from '../../reflectMetadata/data/controllerGuardMetadataReflectKey';
import { controllerMethodGuardMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodGuardMetadataReflectKey';
import { Guard } from '../guard/model/Guard';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function UseGuard(
  ...guardList: Newable<Guard>[]
): ClassDecorator & MethodDecorator {
  return (target: object, key?: string | symbol): void => {
    let classTarget: object;
    let metadataKey: string | symbol;

    if (key === undefined) {
      classTarget = target;
      metadataKey = controllerGuardMetadataReflectKey;
    } else {
      classTarget = target.constructor;
      metadataKey = controllerMethodGuardMetadataReflectKey;
    }

    updateOwnReflectMetadata(
      classTarget,
      metadataKey,
      buildDefaultArrayMetadata,
      buildArrayMetadataWithArray(guardList),
      key,
    );
  };
}
