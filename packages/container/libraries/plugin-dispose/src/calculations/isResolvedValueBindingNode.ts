import {
  bindingTypeValues,
  type FactoryBindingNode,
  type LeafBindingNode,
  type PlanServiceNodeParent,
  type ResolvedValueBindingNode,
} from '@inversifyjs/core';

export function isResolvedValueBindingNode(
  node: PlanServiceNodeParent | FactoryBindingNode | LeafBindingNode,
): node is ResolvedValueBindingNode {
  return node.binding.type === bindingTypeValues.ResolvedValue;
}
