import { type ServiceIdentifier } from '@inversifyjs/common';

import { type MetadataName } from '../../metadata/models/MetadataName.js';
import { type MetadataTag } from '../../metadata/models/MetadataTag.js';

export interface BaseBuildServiceNodeOptions<
  TMultiple extends boolean = boolean,
> {
  isMultiple: TMultiple;
  name: MetadataName | undefined;
  optional: boolean;
  serviceIdentifier: ServiceIdentifier;
  tags: Map<MetadataTag, unknown>;
}
