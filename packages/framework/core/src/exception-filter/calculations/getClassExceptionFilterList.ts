import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classExceptionFilterMetadataReflectKey } from '../../reflectMetadata/data/classExceptionFilterMetadataReflectKey';

export function getClassExceptionFilterList(
  classConstructor: NewableFunction,
): NewableFunction[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classExceptionFilterMetadataReflectKey,
    ) ?? []
  );
}
