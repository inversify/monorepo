import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classExceptionFilterMetadataReflectKey } from '../../reflectMetadata/data/classExceptionFilterMetadataReflectKey';

export function exploreClassExceptionFilterList(
  classConstructor: NewableFunction,
): NewableFunction[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classExceptionFilterMetadataReflectKey,
    ) ?? []
  );
}
