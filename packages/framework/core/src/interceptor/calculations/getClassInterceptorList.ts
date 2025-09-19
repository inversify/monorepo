import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { ServiceIdentifier } from 'inversify';

import { classInterceptorMetadataReflectKey } from '../../reflectMetadata/data/classInterceptorMetadataReflectKey';
import { Interceptor } from '../models/Interceptor';

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
