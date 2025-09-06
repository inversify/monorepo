import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMethodErrorFilterMetadataReflectKey } from '../../reflectMetadata/data/classMethodErrorFilterMetadataReflectKey';

export function getClassMethodErrorFilterList(
  classConstructor: NewableFunction,
  methodKey: string | symbol,
): NewableFunction[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classMethodErrorFilterMetadataReflectKey,
      methodKey,
    ) ?? []
  );
}
