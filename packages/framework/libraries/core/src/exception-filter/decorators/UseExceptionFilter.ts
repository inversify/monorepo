import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { classExceptionFilterMetadataReflectKey } from '../../reflectMetadata/data/classExceptionFilterMetadataReflectKey';
import { classMethodExceptionFilterMetadataReflectKey } from '../../reflectMetadata/data/classMethodExceptionFilterMetadataReflectKey';
import { ExceptionFilter } from '../models/ExceptionFilter';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function UseExceptionFilter(
  ...interceptorList: Newable<ExceptionFilter>[]
): ClassDecorator & MethodDecorator {
  return (target: object, key?: string | symbol): void => {
    let classTarget: object;
    let metadataKey: string | symbol;

    if (key === undefined) {
      classTarget = target;
      metadataKey = classExceptionFilterMetadataReflectKey;
    } else {
      classTarget = target.constructor;
      metadataKey = classMethodExceptionFilterMetadataReflectKey;
    }

    updateOwnReflectMetadata(
      classTarget,
      metadataKey,
      buildEmptyArrayMetadata,
      buildArrayMetadataWithArray(interceptorList),
      key,
    );
  };
}
