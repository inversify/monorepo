import { type PlanService } from './PlanService.js';

export interface Plan {
  readonly id: string;
  readonly root: PlanService;
}
