import { isPromise } from '@inversifyjs/common';

import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';

export function resolveResolvedValueBindingParams<
  TActivated,
  TBinding extends ResolvedValueBinding<TActivated> =
    ResolvedValueBinding<TActivated>,
>(
  params: ResolutionParams,
  node: ResolvedValueBindingNode<TBinding>,
): unknown[] | Promise<unknown[]> {
  const paramsResolvedValues: unknown[] = [];
  let promiseValueFound: boolean = false;

  for (const param of node.params) {
    const resolvedValue: unknown = param.resolve(params);

    if (!promiseValueFound && isPromise(resolvedValue)) {
      promiseValueFound = true;
    }

    paramsResolvedValues.push(resolvedValue);
  }

  return promiseValueFound
    ? Promise.all(paramsResolvedValues)
    : paramsResolvedValues;
}
