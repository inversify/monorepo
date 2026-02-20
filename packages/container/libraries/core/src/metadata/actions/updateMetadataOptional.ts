import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata.js';
import { type MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata.js';

export function updateMetadataOptional(
  metadata: ManagedClassElementMetadata | MaybeManagedClassElementMetadata,
): ManagedClassElementMetadata | MaybeManagedClassElementMetadata {
  if (metadata.optional) {
    throw new InversifyCoreError(
      InversifyCoreErrorKind.injectionDecoratorConflict,
      'Unexpected duplicated optional decorator',
    );
  }

  metadata.optional = true;

  return metadata;
}
