import { type Factory } from '../../binding/models/Factory.js';
import { isPlanServiceRedirectionBindingNode } from '../../planning/calculations/isPlanServiceRedirectionBindingNode.js';
import { type FactoryBindingNode } from '../../planning/models/FactoryBindingNode.js';
import { type LeafBindingNode } from '../../planning/models/LeafBindingNode.js';
import { type PlanBindingNode } from '../../planning/models/PlanBindingNode.js';
import { type PlanServiceNodeParent } from '../../planning/models/PlanServiceNodeParent.js';
import { type PlanServiceRedirectionBindingNode } from '../../planning/models/PlanServiceRedirectionBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved } from '../models/Resolved.js';

function resolveBindingNode<TActivated>(
  params: ResolutionParams,
  planBindingNode:
    | PlanServiceNodeParent
    | LeafBindingNode<TActivated>
    | (TActivated extends Factory<unknown>
        ? FactoryBindingNode<TActivated>
        : never),
): unknown[] {
  if (isPlanServiceRedirectionBindingNode(planBindingNode)) {
    return resolveServiceRedirectionBindingNode(params, planBindingNode);
  }

  return [planBindingNode.resolve(params) as Resolved<TActivated>];
}

export function resolveServiceRedirectionBindingNode(
  params: ResolutionParams,
  node: PlanServiceRedirectionBindingNode,
): unknown[] {
  if (node.redirection.bindings === undefined) {
    return [];
  }

  if (Array.isArray(node.redirection.bindings)) {
    return node.redirection.bindings.flatMap((binding: PlanBindingNode) =>
      resolveBindingNode(params, binding),
    );
  }

  return resolveBindingNode(params, node.redirection.bindings);
}
