import { type PlanMetadataKey } from './PlanMetadataKey.js';
import { type PlanService } from './PlanService.js';

export interface PlanProperty {
  readonly key: PlanMetadataKey;
  readonly service: PlanService;
}
