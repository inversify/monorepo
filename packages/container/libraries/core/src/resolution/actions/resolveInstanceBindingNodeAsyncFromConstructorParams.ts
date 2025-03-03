import { InstanceBinding } from '../../binding/models/InstanceBinding';
import { InstanceBindingNode } from '../../planning/models/InstanceBindingNode';
import { ResolutionParams } from '../models/ResolutionParams';
import { Resolved, SyncResolved } from '../models/Resolved';

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
