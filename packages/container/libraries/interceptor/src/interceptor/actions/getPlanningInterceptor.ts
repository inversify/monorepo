import { getPlanningRegistry } from '../../registry/actions/getPlanningRegistry';
import { PlanningInterceptor } from '../models/PlanningInterceptor';

export function getPlanningInterceptor(
  handle: symbol,
): PlanningInterceptor | undefined {
  return getPlanningRegistry().get(handle);
}
