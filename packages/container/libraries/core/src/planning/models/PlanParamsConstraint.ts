import { MultipleBindingPlanParamsConstraint } from './MultipleBindingPlanParamsConstraint';
import { SingleBindingPlanParamsConstraint } from './SingleBindingPlanParamsConstraint';

export type PlanParamsConstraint =
  | SingleBindingPlanParamsConstraint
  | MultipleBindingPlanParamsConstraint;
