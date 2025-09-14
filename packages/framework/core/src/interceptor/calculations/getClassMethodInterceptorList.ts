import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { classMethodInterceptorMetadataReflectKey } from '../../reflectMetadata/data/classMethodInterceptorMetadataReflectKey';
import { Interceptor } from '../models/Interceptor';

export function getClassMethodInterceptorList(
  classConstructor: NewableFunction,
  methodKey: string | symbol,
): Newable<Interceptor>[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classMethodInterceptorMetadataReflectKey,
      methodKey,
    ) ?? []
  );
}
