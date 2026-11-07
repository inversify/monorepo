import { type BasePlanServiceInspection } from './BasePlanServiceInspection.js';
import { type PlanBindingInspection } from './PlanBindingInspection.js';

export interface SingleBindingPlanServiceInspection extends BasePlanServiceInspection<false> {
  readonly binding: PlanBindingInspection | undefined;
}
