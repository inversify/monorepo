import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { classGuardMetadataReflectKey } from '../../reflectMetadata/data/classGuardMetadataReflectKey.js';
import { classMethodGuardMetadataReflectKey } from '../../reflectMetadata/data/classMethodGuardMetadataReflectKey.js';
import { type Guard } from '../models/Guard.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function UseGuard(
  ...guardList: ServiceIdentifier<Guard>[]
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
