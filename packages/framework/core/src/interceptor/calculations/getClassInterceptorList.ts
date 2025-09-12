import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Newable } from 'inversify';

import { classInterceptorMetadataReflectKey } from '../../reflectMetadata/data/classInterceptorMetadataReflectKey';
import { Interceptor } from '../models/Interceptor';

export function getClassInterceptorList(
  classConstructor: NewableFunction,
): Newable<Interceptor>[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classInterceptorMetadataReflectKey,
    ) ?? []
  );
}
