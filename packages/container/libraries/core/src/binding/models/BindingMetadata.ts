import { ServiceIdentifier } from '@inversifyjs/common';

import { MetadataName } from '../../metadata/models/MetadataName';
import { MetadataTag } from '../../metadata/models/MetadataTag';

export interface BindingMetadata {
  readonly name: MetadataName | undefined;
  readonly tags: Map<MetadataTag, unknown>;
  readonly serviceIdentifier: ServiceIdentifier;

  getAncestor(): BindingMetadata | undefined;
}
