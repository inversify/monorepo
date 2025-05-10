import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { controllerGuardMetadataReflectKey } from '../../reflectMetadata/data/controllerGuardMetadataReflectKey';
import { controllerMethodGuardMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodGuardMetadataReflectKey';
import { buildArrayMetadataWithArray } from '../calculations/buildArrayMetadataWithArray';
import { buildDefaultArrayMetadata } from '../calculations/buildDefaultArrayMetadata';
import { Guard } from '../guard/model/Guard';

export function useGuard(
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
