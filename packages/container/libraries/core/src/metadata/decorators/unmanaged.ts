import { decrementPendingClassMetadataCount } from '../actions/decrementPendingClassMetadataCount.js';
import { buildUnmanagedMetadataFromMaybeClassElementMetadata } from '../calculations/buildUnmanagedMetadataFromMaybeClassElementMetadata.js';
import { type ClassElementMetadata } from '../models/ClassElementMetadata.js';
import { type MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata.js';
import { injectBase } from './injectBase.js';

export function unmanaged(): MethodDecorator &
  ParameterDecorator &
  PropertyDecorator {
  const updateMetadata: (
    classElementMetadata: MaybeClassElementMetadata | undefined,
  ) => ClassElementMetadata =
    buildUnmanagedMetadataFromMaybeClassElementMetadata();

  return injectBase(updateMetadata, decrementPendingClassMetadataCount);
}
