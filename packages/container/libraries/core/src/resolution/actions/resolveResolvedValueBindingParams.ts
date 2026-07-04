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

  for (const param of node.params) {
    paramsResolvedValues.push(param.resolve(params));
  }

  return paramsResolvedValues.some(isPromise)
    ? Promise.all(paramsResolvedValues)
    : paramsResolvedValues;
}
