import { type PlanJsonValue } from './PlanJsonValue.js';
import { type PlanMetadataKey } from './PlanMetadataKey.js';

export interface PlanTag {
  readonly key: PlanMetadataKey;
  readonly value: PlanJsonValue;
}
