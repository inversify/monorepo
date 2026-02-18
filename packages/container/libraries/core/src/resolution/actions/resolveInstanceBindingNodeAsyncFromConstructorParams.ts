import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved, type SyncResolved } from '../models/Resolved.js';

export function resolveInstanceBindingNodeAsyncFromConstructorParams<
  TActivated,
  TBinding extends InstanceBinding<TActivated> = InstanceBinding<TActivated>,
>(
  resolveInstanceBindingNodeFromConstructorParams: (
    constructorValues: unknown[],
    params: ResolutionParams,
    node: InstanceBindingNode<TBinding>,
  ) => Resolved<TActivated>,
): (
  constructorValues: Promise<unknown[]>,
  params: ResolutionParams,
  node: InstanceBindingNode<TBinding>,
) => Promise<SyncResolved<TActivated>> {
  return async (
    constructorValues: Promise<unknown[]>,
    params: ResolutionParams,
    node: InstanceBindingNode<TBinding>,
  ): Promise<SyncResolved<TActivated>> => {
    const constructorResolvedValues: unknown[] = await constructorValues;

    return resolveInstanceBindingNodeFromConstructorParams(
      constructorResolvedValues,
      params,
      node,
    );
  };
}
