import {
  buildEmptySetMetadata,
  updateOwnReflectMetadata,
  updateSetMetadataWithList,
} from '@inversifyjs/reflect-metadata-utils';
import { type Newable } from 'inversify';

import { classErrorFilterMetadataReflectKey } from '../../reflectMetadata/data/classErrorFilterMetadataReflectKey.js';
import { classMethodErrorFilterMetadataReflectKey } from '../../reflectMetadata/data/classMethodErrorFilterMetadataReflectKey.js';
import { type ErrorFilter } from '../models/ErrorFilter.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function UseErrorFilter(
  ...interceptorList: Newable<ErrorFilter>[]
): ClassDecorator & MethodDecorator {
  return (target: object, key?: string | symbol): void => {
    let classTarget: object;
    let metadataKey: string | symbol;

    if (key === undefined) {
      classTarget = target;
      metadataKey = classErrorFilterMetadataReflectKey;
    } else {
      classTarget = target.constructor;
      metadataKey = classMethodErrorFilterMetadataReflectKey;
    }

    updateOwnReflectMetadata(
      classTarget,
      metadataKey,
      buildEmptySetMetadata,
      updateSetMetadataWithList(interceptorList),
      key,
    );
  };
}
