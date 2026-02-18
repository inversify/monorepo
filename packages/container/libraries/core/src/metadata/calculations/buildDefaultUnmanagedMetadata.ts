import { ClassElementMetadataKind } from '../models/ClassElementMetadataKind.js';
import { type UnmanagedClassElementMetadata } from '../models/UnmanagedClassElementMetadata.js';

export function buildDefaultUnmanagedMetadata(): UnmanagedClassElementMetadata {
  return {
    kind: ClassElementMetadataKind.unmanaged,
  };
}
