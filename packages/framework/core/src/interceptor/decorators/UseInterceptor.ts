import {
  buildArrayMetadataWithArray,
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { classInterceptorMetadataReflectKey } from '../../reflectMetadata/data/classInterceptorMetadataReflectKey.js';
import { classMethodInterceptorMetadataReflectKey } from '../../reflectMetadata/data/classMethodInterceptorMetadataReflectKey.js';
import { type Interceptor } from '../models/Interceptor.js';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function UseInterceptor(
  ...interceptorList: ServiceIdentifier<Interceptor>[]
): ClassDecorator & MethodDecorator {
  return (target: object, key?: string | symbol): void => {
    let classTarget: object;
    let metadataKey: string | symbol;

    if (key === undefined) {
      classTarget = target;
      metadataKey = classInterceptorMetadataReflectKey;
    } else {
      classTarget = target.constructor;
      metadataKey = classMethodInterceptorMetadataReflectKey;
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
