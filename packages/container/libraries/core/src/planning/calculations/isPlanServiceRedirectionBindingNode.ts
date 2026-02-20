import { type BindingNodeParent } from '../models/BindingNodeParent.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanServiceRedirectionBindingNode } from '../models/PlanServiceRedirectionBindingNode.js';

export function isPlanServiceRedirectionBindingNode(
  node: PlanBindingNode | BindingNodeParent,
): node is PlanServiceRedirectionBindingNode {
  return (
    (node as Partial<PlanServiceRedirectionBindingNode>).redirections !==
    undefined
  );
}
