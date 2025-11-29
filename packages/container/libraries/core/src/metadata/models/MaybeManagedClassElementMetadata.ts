import { BaseClassElementMetadata } from './BaseClassElementMetadata';
import { MaybeClassElementMetadataKind } from './MaybeClassElementMetadataKind';
import { MetadataName } from './MetadataName';
import { MetadataTag } from './MetadataTag';

export interface MaybeManagedClassElementMetadata extends BaseClassElementMetadata<MaybeClassElementMetadataKind.unknown> {
  name: MetadataName | undefined;
  optional: boolean;
  tags: Map<MetadataTag, unknown>;
}
