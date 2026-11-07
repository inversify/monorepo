import { type MultipleBindingPlanServiceInspection } from './MultipleBindingPlanServiceInspection.js';
import { type SingleBindingPlanServiceInspection } from './SingleBindingPlanServiceInspection.js';

export type PlanServiceInspection =
  | SingleBindingPlanServiceInspection
  | MultipleBindingPlanServiceInspection;
