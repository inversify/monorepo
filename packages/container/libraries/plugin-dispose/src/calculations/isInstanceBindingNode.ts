import {
  bindingTypeValues,
  type FactoryBindingNode,
  type InstanceBindingNode,
  type LeafBindingNode,
  type PlanServiceNodeParent,
} from '@inversifyjs/core';

export function isInstanceBindingNode(
  node: PlanServiceNodeParent | FactoryBindingNode | LeafBindingNode,
): node is InstanceBindingNode {
  return node.binding.type === bindingTypeValues.Instance;
}
