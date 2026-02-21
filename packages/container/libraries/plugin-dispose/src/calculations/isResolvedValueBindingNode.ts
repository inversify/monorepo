import {
  bindingTypeValues,
  type LeafBindingNode,
  type PlanServiceNodeParent,
  type ResolvedValueBindingNode,
} from '@inversifyjs/core';

export function isResolvedValueBindingNode(
  node: PlanServiceNodeParent | LeafBindingNode,
): node is ResolvedValueBindingNode {
  return node.binding.type === bindingTypeValues.ResolvedValue;
}
