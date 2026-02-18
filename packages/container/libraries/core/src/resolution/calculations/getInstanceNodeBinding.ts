import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';

export function getInstanceNodeBinding<TActivated>(
  node: InstanceBindingNode<InstanceBinding<TActivated>>,
): InstanceBinding<TActivated> {
  return node.binding;
}
