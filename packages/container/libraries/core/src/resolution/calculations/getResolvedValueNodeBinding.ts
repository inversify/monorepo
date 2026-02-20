import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode.js';

export function getResolvedValueNodeBinding<TActivated>(
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
): ResolvedValueBinding<TActivated> {
  return node.binding;
}
