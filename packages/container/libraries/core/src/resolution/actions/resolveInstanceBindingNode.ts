import { isPromise } from '@inversifyjs/common';

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved, type SyncResolved } from '../models/Resolved.js';

export function resolveInstanceBindingNode<
  TActivated,
  TBinding extends InstanceBinding<TActivated> = InstanceBinding<TActivated>,
>(
  resolveInstanceBindingConstructorParams: (
    params: ResolutionParams,
    node: InstanceBindingNode<TBinding>,
  ) => unknown[] | Promise<unknown[]>,
  resolveInstanceBindingNodeAsyncFromConstructorParams: (
    constructorValues: Promise<unknown[]>,
    params: ResolutionParams,
    node: InstanceBindingNode<TBinding>,
  ) => Promise<SyncResolved<TActivated>>,
  resolveInstanceBindingNodeFromConstructorParams: (
    constructorValues: unknown[],
    params: ResolutionParams,
    node: InstanceBindingNode<TBinding>,
  ) => Resolved<TActivated>,
): (
  params: ResolutionParams,
  node: InstanceBindingNode<TBinding>,
) => Resolved<TActivated> {
  return (
    params: ResolutionParams,
    node: InstanceBindingNode<TBinding>,
  ): Resolved<TActivated> => {
    const constructorValues: unknown[] | Promise<unknown[]> =
      resolveInstanceBindingConstructorParams(params, node);

    if (isPromise(constructorValues)) {
      return resolveInstanceBindingNodeAsyncFromConstructorParams(
        constructorValues,
        params,
        node,
      );
    }

    return resolveInstanceBindingNodeFromConstructorParams(
      constructorValues,
      params,
      node,
    );
  };
}
