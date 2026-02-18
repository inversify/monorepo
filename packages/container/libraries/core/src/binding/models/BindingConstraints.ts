import { type ServiceIdentifier } from '@inversifyjs/common';

import { type MetadataName } from '../../metadata/models/MetadataName.js';
import { type MetadataTag } from '../../metadata/models/MetadataTag.js';

export interface BindingConstraints {
  readonly name: MetadataName | undefined;
  readonly tags: Map<MetadataTag, unknown>;
  readonly serviceIdentifier: ServiceIdentifier;

  getAncestor(): BindingConstraints | undefined;
}
