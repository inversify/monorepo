import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { ServiceIdentifier } from 'inversify';

import { classMethodInterceptorMetadataReflectKey } from '../../reflectMetadata/data/classMethodInterceptorMetadataReflectKey';
import { Interceptor } from '../models/Interceptor';

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
