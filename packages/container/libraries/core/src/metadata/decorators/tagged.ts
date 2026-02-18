import { incrementPendingClassMetadataCount } from '../actions/incrementPendingClassMetadataCount.js';
import { updateMetadataTag } from '../actions/updateMetadataTag.js';
import { buildMaybeClassElementMetadataFromMaybeClassElementMetadata } from '../calculations/buildMaybeClassElementMetadataFromMaybeClassElementMetadata.js';
import { type ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata.js';
import { type MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata.js';
import { type MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata.js';
import { type MetadataTag } from '../models/MetadataTag.js';
import { injectBase } from './injectBase.js';

export function tagged(
  key: MetadataTag,
  value: unknown,
): MethodDecorator & ParameterDecorator & PropertyDecorator {
  const updateMetadata: (
    metadata: MaybeClassElementMetadata | undefined,
  ) => ManagedClassElementMetadata | MaybeManagedClassElementMetadata =
    buildMaybeClassElementMetadataFromMaybeClassElementMetadata(
      updateMetadataTag(key, value),
    );

  return injectBase(updateMetadata, incrementPendingClassMetadataCount);
}
