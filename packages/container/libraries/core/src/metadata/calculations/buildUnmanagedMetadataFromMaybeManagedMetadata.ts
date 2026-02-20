import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata.js';
import { type MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata.js';
import { type UnmanagedClassElementMetadata } from '../models/UnmanagedClassElementMetadata.js';
import { assertMetadataFromTypescriptIfManaged } from './assertMetadataFromTypescriptIfManaged.js';
import { buildDefaultUnmanagedMetadata } from './buildDefaultUnmanagedMetadata.js';

export function buildUnmanagedMetadataFromMaybeManagedMetadata(
  metadata: MaybeManagedClassElementMetadata | ManagedClassElementMetadata,
): UnmanagedClassElementMetadata {
  assertMetadataFromTypescriptIfManaged(metadata);

  if (hasManagedMetadata(metadata)) {
    throw new InversifyCoreError(
      InversifyCoreErrorKind.injectionDecoratorConflict,
      'Unexpected injection found. Found @unmanaged injection with additional @named, @optional, @tagged or @targetName injections',
    );
  }

  return buildDefaultUnmanagedMetadata();
}

function hasManagedMetadata(
  metadata: MaybeManagedClassElementMetadata | ManagedClassElementMetadata,
): boolean {
  return (
    metadata.name !== undefined || metadata.optional || metadata.tags.size > 0
  );
}
