import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';
import { type ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata.js';
import { type MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata.js';
import { type MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata.js';
import { buildDefaultMaybeClassElementMetadata } from './buildDefaultMaybeClassElementMetadata.js';

export function buildMaybeClassElementMetadataFromMaybeClassElementMetadata(
  updateMetadata: (
    metadata: ManagedClassElementMetadata | MaybeManagedClassElementMetadata,
  ) => ManagedClassElementMetadata | MaybeManagedClassElementMetadata,
): (
  metadata: MaybeClassElementMetadata | undefined,
) => ManagedClassElementMetadata | MaybeManagedClassElementMetadata {
  return (
    metadata: MaybeClassElementMetadata | undefined,
  ): ManagedClassElementMetadata | MaybeManagedClassElementMetadata => {
    const definedMetadata: MaybeClassElementMetadata =
      metadata ?? buildDefaultMaybeClassElementMetadata();

    switch (definedMetadata.kind) {
      case ClassElementMetadataKind.unmanaged:
        throw new InversifyCoreError(
          InversifyCoreErrorKind.injectionDecoratorConflict,
          'Unexpected injection found. Found @unmanaged injection with additional @named, @optional, @tagged or @targetName injections',
        );
      default:
        return updateMetadata(definedMetadata);
    }
  };
}
