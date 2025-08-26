import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMethodGuardMetadataReflectKey } from '../../reflectMetadata/data/classMethodGuardMetadataReflectKey';

export function exploreClassMethodGuardList(
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
