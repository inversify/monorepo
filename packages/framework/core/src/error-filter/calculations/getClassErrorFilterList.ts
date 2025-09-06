import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classErrorFilterMetadataReflectKey } from '../../reflectMetadata/data/classErrorFilterMetadataReflectKey';

export function getClassErrorFilterList(
  classConstructor: NewableFunction,
): NewableFunction[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classErrorFilterMetadataReflectKey,
    ) ?? []
  );
}
