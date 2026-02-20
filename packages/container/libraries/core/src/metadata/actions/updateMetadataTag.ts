import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata.js';
import { type MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata.js';
import { type MetadataTag } from '../models/MetadataTag.js';

export function updateMetadataTag(
  key: MetadataTag,
  value: unknown,
): (
  metadata: ManagedClassElementMetadata | MaybeManagedClassElementMetadata,
) => ManagedClassElementMetadata | MaybeManagedClassElementMetadata {
  return (
    metadata: ManagedClassElementMetadata | MaybeManagedClassElementMetadata,
  ): ManagedClassElementMetadata | MaybeManagedClassElementMetadata => {
    if (metadata.tags.has(key)) {
      throw new InversifyCoreError(
        InversifyCoreErrorKind.injectionDecoratorConflict,
        'Unexpected duplicated tag decorator with existing tag',
      );
    }

    metadata.tags.set(key, value);

    return metadata;
  };
}
