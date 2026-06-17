import { type Factory } from '../../binding/models/Factory.js';
import { isPlanServiceRedirectionBindingNode } from '../../planning/calculations/isPlanServiceRedirectionBindingNode.js';
import { type FactoryBindingNode } from '../../planning/models/FactoryBindingNode.js';
import { type LeafBindingNode } from '../../planning/models/LeafBindingNode.js';
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
): Resolved<TActivated> {
  return planBindingNode.resolve(params) as Resolved<TActivated>;
}

export function resolveServiceRedirectionBindingNode(
  params: ResolutionParams,
  node: PlanServiceRedirectionBindingNode,
): unknown[] {
  const resolvedValues: unknown[] = [];

  for (const redirection of node.redirections) {
    if (isPlanServiceRedirectionBindingNode(redirection)) {
      resolvedValues.push(
        ...resolveServiceRedirectionBindingNode(params, redirection),
      );
    } else {
      resolvedValues.push(resolveBindingNode(params, redirection));
    }
  }

  return resolvedValues;
}
