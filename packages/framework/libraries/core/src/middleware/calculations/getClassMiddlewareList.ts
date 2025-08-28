import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMiddlewareMetadataReflectKey';

export function getClassMiddlewareList(
  classConstructor: NewableFunction,
): NewableFunction[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classMiddlewareMetadataReflectKey,
    ) ?? []
  );
}
