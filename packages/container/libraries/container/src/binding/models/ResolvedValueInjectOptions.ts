import { LazyServiceIdentifier, ServiceIdentifier } from '@inversifyjs/common';
import { MetadataName, MetadataTag } from '@inversifyjs/core';

export type ResolvedValueInjectOptions<T> =
  | LazyServiceIdentifier<T>
  | ResolvedValueMetadataInjectOptions<T>
  | ServiceIdentifier<T>;

export interface ResolvedValueMetadataInjectOptions<T> {
  isMultiple?: true;
  name?: MetadataName;
  optional?: true;
  serviceIdentifier: ServiceIdentifier<T> | LazyServiceIdentifier<T>;
  tags?: ResolvedValueMetadataInjectTagOptions[];
}

export interface ResolvedValueMetadataInjectTagOptions {
  key: MetadataTag;
  value: unknown;
}
