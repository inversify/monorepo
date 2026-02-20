import { type GetPlanOptions } from '../models/GetPlanOptions.js';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode.js';
import { type NonCachedServiceNodeContext } from '../models/NonCachedServiceNodeContext.js';
import { type PlanParamsOperations } from '../models/PlanParamsOperations.js';
import { type PlanResult } from '../models/PlanResult.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';

export function cacheNonRootPlanServiceNode(
  getPlanOptions: GetPlanOptions | undefined,
  operations: PlanParamsOperations,
  planServiceNode: PlanServiceNode,
  context: NonCachedServiceNodeContext,
): void {
  if (
    getPlanOptions !== undefined &&
    ((LazyPlanServiceNode.is(planServiceNode) &&
      !planServiceNode.isExpanded()) ||
      planServiceNode.isContextFree)
  ) {
    const planResult: PlanResult = {
      tree: {
        root: planServiceNode,
      },
    };

    operations.setPlan(getPlanOptions, planResult);
  } else {
    operations.setNonCachedServiceNode(planServiceNode, context);
  }
}
