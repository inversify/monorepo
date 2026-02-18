import { MaybeClassElementMetadataKind } from '../models/MaybeClassElementMetadataKind.js';
import { type MaybeManagedClassElementMetadata } from '../models/MaybeManagedClassElementMetadata.js';

export function buildDefaultMaybeClassElementMetadata(): MaybeManagedClassElementMetadata {
  return {
    kind: MaybeClassElementMetadataKind.unknown,
    name: undefined,
    optional: false,
    tags: new Map(),
  };
}
