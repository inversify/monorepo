import { LazyServiceIdentifier, ServiceIdentifier } from '@inversifyjs/common';

import { BaseClassElementMetadata } from './BaseClassElementMetadata';
import { MetadataName } from './MetadataName';
import { MetadataTag } from './MetadataTag';

export interface BaseManagedClassElementMetadata<
  TKind,
> extends BaseClassElementMetadata<TKind> {
  isFromTypescriptParamType?: true;
  name: MetadataName | undefined;
  optional: boolean;
  tags: Map<MetadataTag, unknown>;
  value: ServiceIdentifier | LazyServiceIdentifier;
}
