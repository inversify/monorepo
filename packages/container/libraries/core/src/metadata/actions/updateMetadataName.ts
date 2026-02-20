import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata.js';
import { type MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata.js';
import { type MetadataName } from '../models/MetadataName.js';

export function updateMetadataName(
  name: MetadataName,
): (
  metadata: ManagedClassElementMetadata | MaybeManagedClassElementMetadata,
) => ManagedClassElementMetadata | MaybeManagedClassElementMetadata {
  return (
    metadata: ManagedClassElementMetadata | MaybeManagedClassElementMetadata,
  ): ManagedClassElementMetadata | MaybeManagedClassElementMetadata => {
    if (metadata.name !== undefined) {
      throw new InversifyCoreError(
        InversifyCoreErrorKind.injectionDecoratorConflict,
        'Unexpected duplicated named decorator',
      );
    }

    metadata.name = name;

    return metadata;
  };
}
