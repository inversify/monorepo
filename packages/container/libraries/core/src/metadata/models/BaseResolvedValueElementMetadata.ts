import { LazyServiceIdentifier, ServiceIdentifier } from '@inversifyjs/common';

import { MetadataName } from './MetadataName';
import { MetadataTag } from './MetadataTag';

export interface BaseResolvedValueElementMetadata<TKind> {
  kind: TKind;
  name: MetadataName | undefined;
  optional: boolean;
  tags: Map<MetadataTag, unknown>;
  value: ServiceIdentifier | LazyServiceIdentifier;
}
