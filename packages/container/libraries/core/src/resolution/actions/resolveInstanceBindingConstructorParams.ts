import { isPromise } from '@inversifyjs/common';

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';

export function resolveInstanceBindingConstructorParams<
  TActivated,
  TBinding extends InstanceBinding<TActivated> = InstanceBinding<TActivated>,
>(
  params: ResolutionParams,
  node: InstanceBindingNode<TActivated, TBinding>,
): unknown[] | Promise<unknown[]> {
  const constructorResolvedValues: unknown[] = [];

  for (const constructorParam of node.constructorParams) {
    if (constructorParam === undefined) {
      constructorResolvedValues.push(undefined);
    } else {
      constructorResolvedValues.push(constructorParam.resolve(params));
    }
  }

  return constructorResolvedValues.some(isPromise)
    ? Promise.all(constructorResolvedValues)
    : constructorResolvedValues;
}
