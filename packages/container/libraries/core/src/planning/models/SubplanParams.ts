import { type BasePlanParams } from './BasePlanParams.js';
import { type PlanServiceNodeParent } from './PlanServiceNodeParent.js';

export interface SubplanParams extends BasePlanParams {
  node: PlanServiceNodeParent;
}
