import { type PlanBinding } from './PlanBinding.js';
import { type PlanMetadataKey } from './PlanMetadataKey.js';
import { type PlanServiceIdentifier } from './PlanServiceIdentifier.js';
import { type PlanTag } from './PlanTag.js';

export interface PlanService {
  readonly id: string;
  readonly bindings: readonly PlanBinding[];
  readonly chained: boolean | null;
  readonly isMultiple: boolean;
  readonly name: PlanMetadataKey | null;
  readonly optional: boolean;
  readonly serviceIdentifier: PlanServiceIdentifier;
  readonly tags: readonly PlanTag[];
}
