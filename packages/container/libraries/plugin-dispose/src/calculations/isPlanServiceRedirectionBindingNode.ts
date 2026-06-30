import {
  type PlanBindingNode,
  type PlanServiceRedirectionBindingNode,
} from '@inversifyjs/core';

const REDIRECTION_KEY: keyof PlanServiceRedirectionBindingNode = 'redirection';

export function isPlanServiceRedirectionBindingNode(
  node: PlanBindingNode,
): node is PlanServiceRedirectionBindingNode {
  return REDIRECTION_KEY in node;
}
