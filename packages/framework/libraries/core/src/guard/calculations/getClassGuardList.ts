import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classGuardMetadataReflectKey } from '../../reflectMetadata/data/classGuardMetadataReflectKey';

export function getClassGuardList(
  classConstructor: NewableFunction,
): NewableFunction[] {
  return (
    getOwnReflectMetadata(classConstructor, classGuardMetadataReflectKey) ?? []
  );
}
