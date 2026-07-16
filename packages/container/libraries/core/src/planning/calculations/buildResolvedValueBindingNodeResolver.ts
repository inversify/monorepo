import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { resolveResolvedValueBindingNode } from '../../resolution/actions/resolveResolvedValueBindingNode.js';
import { resolveScoped } from '../../resolution/actions/resolveScoped.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { buildNoActivationsResolvedValueBindingNodeResolver } from './buildNoActivationsResolvedValueBindingNodeResolver.js';
import { buildNoActivationsResolvedValueBindingNodeResolverOnCsp } from './buildNoActivationsResolvedValueBindingNodeResolverOnCsp.js';

const resolveScopedResolvedValueBindingNode: <TActivated>(
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
) => (params: ResolutionParams) => Resolved<TActivated> = <TActivated>(
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
) =>
  resolveScoped<
    TActivated,
    typeof bindingTypeValues.ResolvedValue,
    ResolvedValueBinding<TActivated>,
    ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>
  >(node, resolveResolvedValueBindingNode);

export function buildResolvedValueBindingNodeResolver<TActivated>(
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
  jitEnabled: boolean,
): (params: ResolutionParams) => Resolved<TActivated> {
  if (node.binding.onActivation === undefined) {
    if (jitEnabled) {
      return buildNoActivationsResolvedValueBindingNodeResolver(node);
    } else {
      return buildNoActivationsResolvedValueBindingNodeResolverOnCsp(node);
    }
  }

  return resolveScopedResolvedValueBindingNode(node);
}
