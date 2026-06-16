import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type SyncResolved } from '../models/Resolved.js';
import { resolveBindingServiceActivations } from './resolveBindingServiceActivations.js';
import { resolveInstanceBindingNodeFromConstructorParams } from './resolveInstanceBindingNodeFromConstructorParams.js';

export async function resolveInstanceBindingNodeAsyncFromOnlyConstructorParams<
  TActivated,
  TBinding extends InstanceBinding<TActivated> = InstanceBinding<TActivated>,
>(
  constructorValues: Promise<unknown[]>,
  params: ResolutionParams,
  node: InstanceBindingNode<TActivated, TBinding>,
): Promise<SyncResolved<TActivated>> {
  return resolveBindingServiceActivations<TActivated>(
    params,
    node.binding.serviceIdentifier,
    new node.binding.implementationType(...(await constructorValues)),
  );
}

export async function resolveInstanceBindingNodeAsyncFromConstructorParams<
  TActivated,
  TBinding extends InstanceBinding<TActivated> = InstanceBinding<TActivated>,
>(
  constructorValues: Promise<unknown[]>,
  params: ResolutionParams,
  node: InstanceBindingNode<TActivated, TBinding>,
): Promise<SyncResolved<TActivated>> {
  const constructorResolvedValues: unknown[] = await constructorValues;

  return resolveInstanceBindingNodeFromConstructorParams(
    constructorResolvedValues,
    params,
    node,
  );
}
