import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { resolveInstanceBindingConstructorParams } from '../../resolution/actions/resolveInstanceBindingConstructorParams.js';
import { resolveInstanceBindingNode as curryResolveInstanceBindingNode } from '../../resolution/actions/resolveInstanceBindingNode.js';
import {
  resolveInstanceBindingNodeAsyncFromConstructorParams,
  resolveInstanceBindingNodeAsyncFromOnlyConstructorParams,
} from '../../resolution/actions/resolveInstanceBindingNodeAsyncFromConstructorParams.js';
import {
  resolveInstanceBindingNodeFromConstructorParams,
  resolveInstanceBindingNodeFromOnlyConstructorParams,
} from '../../resolution/actions/resolveInstanceBindingNodeFromConstructorParams.js';
import { resolveScoped } from '../../resolution/actions/resolveScoped.js';
import { resolveScopedWithNoActivations } from '../../resolution/actions/resolveScopedWithNoActivations.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';

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

const resolveInstanceBindingNodeWithOnlyConstructorParams: <
  TActivated,
  TBinding extends InstanceBinding<TActivated> = InstanceBinding<TActivated>,
>(
  params: ResolutionParams,
  node: InstanceBindingNode<TActivated, TBinding>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Resolved<TActivated> = curryResolveInstanceBindingNode<any, any>(
  resolveInstanceBindingConstructorParams,
  resolveInstanceBindingNodeAsyncFromOnlyConstructorParams,
  resolveInstanceBindingNodeFromOnlyConstructorParams,
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

const resolveScopedInstanceBindingNodeWithOnlyConstructorParams: <TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
) => (params: ResolutionParams) => Resolved<TActivated> = <TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
) =>
  resolveScopedWithNoActivations<
    TActivated,
    typeof bindingTypeValues.Instance,
    InstanceBinding<TActivated>,
    InstanceBindingNode<TActivated, InstanceBinding<TActivated>>
  >(node, resolveInstanceBindingNodeWithOnlyConstructorParams);

export function buildInstanceBindingNodeResolver<TActivated>(
  binding: InstanceBinding<TActivated>,
  classMetadata: ClassMetadata,
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
): (params: ResolutionParams) => Resolved<TActivated> {
  if (
    classMetadata.lifecycle.postConstructMethodNames.size === 0 &&
    binding.onActivation === undefined &&
    classMetadata.properties.size === 0
  ) {
    return resolveScopedInstanceBindingNodeWithOnlyConstructorParams(node);
  }

  return resolveScopedInstanceBindingNode(node);
}
