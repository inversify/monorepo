import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMethodInterceptorMetadataReflectKey } from '../../reflectMetadata/data/classMethodInterceptorMetadataReflectKey';

export function exploreClassMethodInterceptorList(
  classConstructor: NewableFunction,
  methodKey: string | symbol,
): NewableFunction[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classMethodInterceptorMetadataReflectKey,
      methodKey,
    ) ?? []
  );
}
