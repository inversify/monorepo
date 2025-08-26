import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMethodExceptionFilterMetadataReflectKey } from '../../reflectMetadata/data/classMethodExceptionFilterMetadataReflectKey';

export function exploreClassMethodExceptionFilterList(
  classConstructor: NewableFunction,
  methodKey: string | symbol,
): NewableFunction[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classMethodExceptionFilterMetadataReflectKey,
      methodKey,
    ) ?? []
  );
}
