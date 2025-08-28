import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMethodExceptionFilterMetadataReflectKey } from '../../reflectMetadata/data/classMethodExceptionFilterMetadataReflectKey';

export function getClassMethodExceptionFilterList(
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
