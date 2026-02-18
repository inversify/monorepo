import { incrementPendingClassMetadataCount } from '../actions/incrementPendingClassMetadataCount.js';
import { updateMetadataOptional } from '../actions/updateMetadataOptional.js';
import { buildMaybeClassElementMetadataFromMaybeClassElementMetadata } from '../calculations/buildMaybeClassElementMetadataFromMaybeClassElementMetadata.js';
import { type ManagedClassElementMetadata } from '../models/ManagedClassElementMetadata.js';
import { type MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata.js';
import { type MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata.js';
import { injectBase } from './injectBase.js';

export function optional(): MethodDecorator &
  ParameterDecorator &
  PropertyDecorator {
  const updateMetadata: (
    metadata: MaybeClassElementMetadata | undefined,
  ) => ManagedClassElementMetadata | MaybeManagedClassElementMetadata =
    buildMaybeClassElementMetadataFromMaybeClassElementMetadata(
      updateMetadataOptional,
    );

  return injectBase(updateMetadata, incrementPendingClassMetadataCount);
}
