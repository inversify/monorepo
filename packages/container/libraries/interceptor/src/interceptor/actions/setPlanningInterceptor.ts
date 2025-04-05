import { getPlanningRegistry } from '../../registry/actions/getPlanningRegistry';
import { PlanningInterceptor } from '../models/PlanningInterceptor';

export function setPlanningInterceptor(
  handle: symbol,
  interceptor: PlanningInterceptor,
): void {
  getPlanningRegistry().set(handle, interceptor);
}
