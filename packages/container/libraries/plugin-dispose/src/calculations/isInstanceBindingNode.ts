import {
  bindingTypeValues,
  type InstanceBindingNode,
  type LeafBindingNode,
  type PlanServiceNodeParent,
} from '@inversifyjs/core';

export function isInstanceBindingNode(
  node: PlanServiceNodeParent | LeafBindingNode,
): node is InstanceBindingNode {
  return node.binding.type === bindingTypeValues.Instance;
}
