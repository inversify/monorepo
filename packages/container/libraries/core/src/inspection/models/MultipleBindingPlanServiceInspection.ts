import { type BasePlanServiceInspection } from './BasePlanServiceInspection.js';
import { type PlanBindingInspection } from './PlanBindingInspection.js';

export interface MultipleBindingPlanServiceInspection extends BasePlanServiceInspection<true> {
  readonly bindings: readonly PlanBindingInspection[];
  readonly chained: boolean;
}
