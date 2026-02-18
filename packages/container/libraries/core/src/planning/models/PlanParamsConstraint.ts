import { type MultipleBindingPlanParamsConstraint } from './MultipleBindingPlanParamsConstraint.js';
import { type SingleBindingPlanParamsConstraint } from './SingleBindingPlanParamsConstraint.js';

export type PlanParamsConstraint =
  | SingleBindingPlanParamsConstraint
  | MultipleBindingPlanParamsConstraint;
