import { type ClassElementMetadata } from '../models/ClassElementMetadata.js';
import { type MaybeClassElementMetadata } from '../models/MaybeClassElementMetadata.js';
import { buildClassElementMetadataFromMaybeClassElementMetadata } from './buildClassElementMetadataFromMaybeClassElementMetadata.js';
import { buildDefaultUnmanagedMetadata } from './buildDefaultUnmanagedMetadata.js';
import { buildUnmanagedMetadataFromMaybeManagedMetadata } from './buildUnmanagedMetadataFromMaybeManagedMetadata.js';

export const buildUnmanagedMetadataFromMaybeClassElementMetadata: () => (
  metadata: MaybeClassElementMetadata | undefined,
) => ClassElementMetadata =
  buildClassElementMetadataFromMaybeClassElementMetadata(
    buildDefaultUnmanagedMetadata,
    buildUnmanagedMetadataFromMaybeManagedMetadata,
  );
