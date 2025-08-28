import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classInterceptorMetadataReflectKey } from '../../reflectMetadata/data/classInterceptorMetadataReflectKey';

export function getClassInterceptorList(
  classConstructor: NewableFunction,
): NewableFunction[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classInterceptorMetadataReflectKey,
    ) ?? []
  );
}
