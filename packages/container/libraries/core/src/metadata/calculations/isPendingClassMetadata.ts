import { type Newable } from '@inversifyjs/common';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { pendingClassMetadataCountReflectKey } from '../../reflectMetadata/data/pendingClassMetadataCountReflectKey.js';

export function isPendingClassMetadata(type: Newable): boolean {
  const pendingClassMetadataCount: number | undefined = getOwnReflectMetadata(
    type,
    pendingClassMetadataCountReflectKey,
  );

  return (
    pendingClassMetadataCount !== undefined && pendingClassMetadataCount !== 0
  );
}
