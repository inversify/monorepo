import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { Guard } from '../guard/model/Guard';
import { classGuardMetadataReflectKey } from '../reflectMetadata/data/classGuardMetadataReflectKey';
import { classMethodGuardMetadataReflectKey } from '../reflectMetadata/data/classMethodGuardMetadataReflectKey';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function UseGuard(
  ...guardList: Newable<Guard>[]
): ClassDecorator & MethodDecorator {
  return (target: object, key?: string | symbol): void => {
    let classTarget: object;
    let metadataKey: string | symbol;

    if (key === undefined) {
      classTarget = target;
      metadataKey = classGuardMetadataReflectKey;
    } else {
      classTarget = target.constructor;
      metadataKey = classMethodGuardMetadataReflectKey;
    }

    updateOwnReflectMetadata(
      classTarget,
      metadataKey,
      buildEmptyArrayMetadata,
      buildArrayMetadataWithArray(guardList),
      key,
    );
  };
}
