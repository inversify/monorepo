import { PlanningInterceptor } from '../../interceptor/models/PlanningInterceptor';

export function getPlanningRegistry(): Map<symbol, PlanningInterceptor> {
  if (globalThis.__INVERSIFY_PLANNING_INTERCEPTOR_REGISTRY === undefined) {
    globalThis.__INVERSIFY_PLANNING_INTERCEPTOR_REGISTRY = new Map();
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return globalThis.__INVERSIFY_PLANNING_INTERCEPTOR_REGISTRY;
}
