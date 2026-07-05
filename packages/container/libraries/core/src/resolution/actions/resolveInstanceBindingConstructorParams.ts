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
  let promiseValueFound: boolean = false;

  for (const constructorParam of node.constructorParams) {
    const resolvedValue: unknown = constructorParam.resolve(params);

    if (!promiseValueFound && isPromise(resolvedValue)) {
      promiseValueFound = true;
    }

    constructorResolvedValues.push(resolvedValue);
  }

  return promiseValueFound
    ? Promise.all(constructorResolvedValues)
    : constructorResolvedValues;
}
