import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { classMethodInterceptorMetadataReflectKey } from '../../reflectMetadata/data/classMethodInterceptorMetadataReflectKey.js';
import { type Interceptor } from '../models/Interceptor.js';

export function getClassMethodInterceptorList(
  classConstructor: NewableFunction,
  methodKey: string | symbol,
): ServiceIdentifier<Interceptor>[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classMethodInterceptorMetadataReflectKey,
      methodKey,
    ) ?? []
  );
}
