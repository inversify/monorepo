import { isPlanServiceRedirectionBindingNode } from '../../planning/calculations/isPlanServiceRedirectionBindingNode.js';
import { type LeafBindingNode } from '../../planning/models/LeafBindingNode.js';
import { type PlanServiceNodeParent } from '../../planning/models/PlanServiceNodeParent.js';
import { type PlanServiceRedirectionBindingNode } from '../../planning/models/PlanServiceRedirectionBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';

export function resolveServiceRedirectionBindingNode(
  resolveBindingNode: (
    params: ResolutionParams,
    planBindingNode: PlanServiceNodeParent | LeafBindingNode,
  ) => unknown,
): (
  params: ResolutionParams,
  node: PlanServiceRedirectionBindingNode,
) => unknown[] {
  function innerResolveServiceRedirectionBindingNode(
    params: ResolutionParams,
    node: PlanServiceRedirectionBindingNode,
  ): unknown[] {
    const resolvedValues: unknown[] = [];

    for (const redirection of node.redirections) {
      if (isPlanServiceRedirectionBindingNode(redirection)) {
        resolvedValues.push(
          ...innerResolveServiceRedirectionBindingNode(params, redirection),
        );
      } else {
        resolvedValues.push(resolveBindingNode(params, redirection));
      }
    }

    return resolvedValues;
  }

  return innerResolveServiceRedirectionBindingNode;
}
