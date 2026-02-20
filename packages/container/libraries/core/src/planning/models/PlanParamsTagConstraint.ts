import { type MetadataTag } from '../../metadata/models/MetadataTag.js';

export interface PlanParamsTagConstraint {
  key: MetadataTag;
  value: unknown;
}
