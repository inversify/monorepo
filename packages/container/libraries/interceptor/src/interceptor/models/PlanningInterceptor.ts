import type { PlanParams, PlanResult } from '@inversifyjs/core';

export interface PlanningInterceptor {
  (params: PlanParams, next: (params: PlanParams) => PlanResult): PlanResult;
}
