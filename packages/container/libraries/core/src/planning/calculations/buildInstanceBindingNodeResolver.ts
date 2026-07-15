import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { resolveInstanceBindingConstructorParams } from '../../resolution/actions/resolveInstanceBindingConstructorParams.js';
import { resolveInstanceBindingNode as curryResolveInstanceBindingNode } from '../../resolution/actions/resolveInstanceBindingNode.js';
import { resolveInstanceBindingNodeAsyncFromConstructorParams } from '../../resolution/actions/resolveInstanceBindingNodeAsyncFromConstructorParams.js';
import { resolveInstanceBindingNodeFromConstructorParams } from '../../resolution/actions/resolveInstanceBindingNodeFromConstructorParams.js';
import { resolveScoped } from '../../resolution/actions/resolveScoped.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { buildNoActivationsInstanceBindingNodeResolver } from './buildNoActivationsInstanceBindingNodeResolver.js';
import { buildNoActivationsInstanceBindingNodeResolverOnCsp } from './buildNoActivationsInstanceBindingNodeResolverOnCsp.js';

const resolveInstanceBindingNode: <
  TActivated,
  TBinding extends InstanceBinding<TActivated> = InstanceBinding<TActivated>,
>(
  params: ResolutionParams,
  node: InstanceBindingNode<TActivated, TBinding>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Resolved<TActivated> = curryResolveInstanceBindingNode<any, any>(
  resolveInstanceBindingConstructorParams,
  resolveInstanceBindingNodeAsyncFromConstructorParams,
  resolveInstanceBindingNodeFromConstructorParams,
);

const resolveScopedInstanceBindingNode: <TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
) => (params: ResolutionParams) => Resolved<TActivated> = <TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
) =>
  resolveScoped<
    TActivated,
    typeof bindingTypeValues.Instance,
    InstanceBinding<TActivated>,
    InstanceBindingNode<TActivated, InstanceBinding<TActivated>>
  >(node, resolveInstanceBindingNode);

export function buildInstanceBindingNodeResolver<TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
  jitEnabled: boolean,
): (params: ResolutionParams) => Resolved<TActivated> {
  if (
    node.classMetadata.lifecycle.postConstructMethodNames.size === 0 &&
    node.binding.onActivation === undefined
  ) {
    if (jitEnabled) {
      return buildNoActivationsInstanceBindingNodeResolver(node);
    } else {
      return buildNoActivationsInstanceBindingNodeResolverOnCsp(node);
    }
  }

  return resolveScopedInstanceBindingNode(node);
}
