import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { type PlanServiceNodeParent } from '../models/PlanServiceNodeParent.js';

export function isInstanceBindingNode(
  node: PlanServiceNodeParent,
): node is InstanceBindingNode {
  return node.binding.type === bindingTypeValues.Instance;
}
