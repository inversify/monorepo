import { updateOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { pendingClassMetadataCountReflectKey } from '../../reflectMetadata/data/pendingClassMetadataCountReflectKey.js';
import { getDefaultPendingClassMetadataCount } from '../calculations/getDefaultPendingClassMetadataCount.js';
import { type MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata.js';
import { MaybeClassElementMetadataKind } from '../models/MaybeClassElementMetadataKind.js';

export function decrementPendingClassMetadataCount(
  type: object,
): (metadata: MaybeClassElementMetadata | undefined) => void {
  return (metadata: MaybeClassElementMetadata | undefined): void => {
    if (
      metadata !== undefined &&
      metadata.kind === MaybeClassElementMetadataKind.unknown
    ) {
      updateOwnReflectMetadata(
        type,
        pendingClassMetadataCountReflectKey,
        getDefaultPendingClassMetadataCount,
        (count: number) => count - 1,
      );
    }
  };
}
