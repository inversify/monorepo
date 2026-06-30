import { type BindingNodeParent } from '../models/BindingNodeParent.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanServiceRedirectionBindingNode } from '../models/PlanServiceRedirectionBindingNode.js';

const REDIRECTION_KEY: keyof PlanServiceRedirectionBindingNode = 'redirection';

export function isPlanServiceRedirectionBindingNode(
  node: PlanBindingNode | BindingNodeParent,
): node is PlanServiceRedirectionBindingNode {
  return REDIRECTION_KEY in node;
}
