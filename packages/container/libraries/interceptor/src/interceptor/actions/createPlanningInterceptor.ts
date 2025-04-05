import { PlanningInterceptor } from '../models/PlanningInterceptor';
import { setPlanningInterceptor } from './setPlanningInterceptor';

export function createPlanningInterceptor(
  interceptor: PlanningInterceptor,
): symbol {
  const handle: symbol = Symbol();

  setPlanningInterceptor(handle, interceptor);

  return handle;
}
