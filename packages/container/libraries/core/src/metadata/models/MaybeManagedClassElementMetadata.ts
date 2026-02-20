import { type BaseClassElementMetadata } from './BaseClassElementMetadata.js';
import { type MaybeClassElementMetadataKind } from './MaybeClassElementMetadataKind.js';
import { type MetadataName } from './MetadataName.js';
import { type MetadataTag } from './MetadataTag.js';

export interface MaybeManagedClassElementMetadata extends BaseClassElementMetadata<MaybeClassElementMetadataKind.unknown> {
  name: MetadataName | undefined;
  optional: boolean;
  tags: Map<MetadataTag, unknown>;
}
