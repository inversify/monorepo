import {
  type LazyServiceIdentifier,
  type ServiceIdentifier,
} from '@inversifyjs/common';

import { type MetadataName } from './MetadataName.js';
import { type MetadataTag } from './MetadataTag.js';

export interface BaseResolvedValueElementMetadata<TKind> {
  kind: TKind;
  name: MetadataName | undefined;
  optional: boolean;
  tags: Map<MetadataTag, unknown>;
  value: ServiceIdentifier | LazyServiceIdentifier;
}
