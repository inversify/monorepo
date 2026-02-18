import { isPromise } from '@inversifyjs/common';

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';

export function resolveInstanceBindingConstructorParams<
  TActivated,
  TBinding extends InstanceBinding<TActivated> = InstanceBinding<TActivated>,
>(
  resolveServiceNode: (
    params: ResolutionParams,
    serviceNode: PlanServiceNode,
  ) => unknown,
): (
  params: ResolutionParams,
  node: InstanceBindingNode<TBinding>,
) => unknown[] | Promise<unknown[]> {
  return (
    params: ResolutionParams,
    node: InstanceBindingNode<TBinding>,
  ): unknown[] | Promise<unknown[]> => {
    const constructorResolvedValues: unknown[] = [];

    for (const constructorParam of node.constructorParams) {
      if (constructorParam === undefined) {
        constructorResolvedValues.push(undefined);
      } else {
        constructorResolvedValues.push(
          resolveServiceNode(params, constructorParam),
        );
      }
    }

    return constructorResolvedValues.some(isPromise)
      ? Promise.all(constructorResolvedValues)
      : constructorResolvedValues;
  };
}
