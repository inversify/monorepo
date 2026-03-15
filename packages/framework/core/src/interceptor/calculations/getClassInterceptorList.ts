import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type ServiceIdentifier } from 'inversify';

import { classInterceptorMetadataReflectKey } from '../../reflectMetadata/data/classInterceptorMetadataReflectKey.js';
import { type Interceptor } from '../models/Interceptor.js';

export function getClassInterceptorList(
  classConstructor: NewableFunction,
): ServiceIdentifier<Interceptor>[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classInterceptorMetadataReflectKey,
    ) ?? []
  );
}
