import { GetPlanOptions } from '../models/GetPlanOptions';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode';
import { NonCachedServiceNodeContext } from '../models/NonCachedServiceNodeContext';
import { PlanParamsOperations } from '../models/PlanParamsOperations';
import { PlanResult } from '../models/PlanResult';
import { PlanServiceNode } from '../models/PlanServiceNode';

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
