import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { classMiddlewareMetadataReflectKey } from '../../reflectMetadata/data/classMiddlewareMetadataReflectKey';

export function exploreClassMiddlewareList(
  classConstructor: NewableFunction,
): NewableFunction[] {
  return (
    getOwnReflectMetadata(
      classConstructor,
      classMiddlewareMetadataReflectKey,
    ) ?? []
  );
}
