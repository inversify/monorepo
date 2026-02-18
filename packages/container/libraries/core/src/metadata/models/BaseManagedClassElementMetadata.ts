import {
  type LazyServiceIdentifier,
  type ServiceIdentifier,
} from '@inversifyjs/common';

import { type BaseClassElementMetadata } from './BaseClassElementMetadata.js';
import { type MetadataName } from './MetadataName.js';
import { type MetadataTag } from './MetadataTag.js';

export interface BaseManagedClassElementMetadata<
  TKind,
> extends BaseClassElementMetadata<TKind> {
  isFromTypescriptParamType?: true;
  name: MetadataName | undefined;
  optional: boolean;
  tags: Map<MetadataTag, unknown>;
  value: ServiceIdentifier | LazyServiceIdentifier;
}
