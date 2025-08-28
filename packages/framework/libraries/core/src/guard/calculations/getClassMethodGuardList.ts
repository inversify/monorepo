import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMethodGuardMetadataReflectKey } from '../../reflectMetadata/data/classMethodGuardMetadataReflectKey';

export function getClassMethodGuardList(
  classConstructor: NewableFunction,
  methodKey: string | symbol,
): NewableFunction[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classMethodGuardMetadataReflectKey,
      methodKey,
    ) ?? []
  );
}
