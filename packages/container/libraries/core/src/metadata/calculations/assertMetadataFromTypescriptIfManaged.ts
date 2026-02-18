import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata.js';
import { MaybeClassElementMetadataKind } from '../models/MaybeClassElementMetadataKind.js';
import { type MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata.js';

export function assertMetadataFromTypescriptIfManaged(
  metadata: MaybeManagedClassElementMetadata | ManagedClassElementMetadata,
): void {
  if (
    metadata.kind !== MaybeClassElementMetadataKind.unknown &&
    metadata.isFromTypescriptParamType !== true
  ) {
    throw new InversifyCoreError(
      InversifyCoreErrorKind.injectionDecoratorConflict,
      'Unexpected injection found. Multiple @inject, @multiInject or @unmanaged decorators found',
    );
  }
}
