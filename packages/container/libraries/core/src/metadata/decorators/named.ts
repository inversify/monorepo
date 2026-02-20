import { incrementPendingClassMetadataCount } from '../actions/incrementPendingClassMetadataCount.js';
import { updateMetadataName } from '../actions/updateMetadataName.js';
import { buildMaybeClassElementMetadataFromMaybeClassElementMetadata } from '../calculations/buildMaybeClassElementMetadataFromMaybeClassElementMetadata.js';
import { type ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata.js';
import { type MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata.js';
import { type MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata.js';
import { type MetadataName } from '../models/MetadataName.js';
import { injectBase } from './injectBase.js';

export function named(
  name: MetadataName,
): MethodDecorator & ParameterDecorator & PropertyDecorator {
  const updateMetadata: (
    metadata: MaybeClassElementMetadata | undefined,
  ) => ManagedClassElementMetadata | MaybeManagedClassElementMetadata =
    buildMaybeClassElementMetadataFromMaybeClassElementMetadata(
      updateMetadataName(name),
    );

  return injectBase(updateMetadata, incrementPendingClassMetadataCount);
}
