import { type ServiceIdentifier } from '@inversifyjs/common';

import { type MetadataName } from '../../metadata/models/MetadataName.js';
import { type MetadataTag } from '../../metadata/models/MetadataTag.js';

export interface BasePlanServiceInspection<TMultiple extends boolean> {
  readonly isMultiple: TMultiple;
  readonly name: MetadataName | undefined;
  readonly optional: boolean;
  readonly serviceIdentifier: ServiceIdentifier;
  readonly tags: ReadonlyMap<MetadataTag, unknown>;
}
