import { type BasePlanParams } from './BasePlanParams.js';
import { type PlanParamsConstraint } from './PlanParamsConstraint.js';

export interface PlanParams extends BasePlanParams {
  rootConstraints: PlanParamsConstraint;
}
