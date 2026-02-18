import { isPromise } from '@inversifyjs/common';

import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';

export function resolveResolvedValueBindingParams<
  TActivated,
  TBinding extends ResolvedValueBinding<TActivated> =
    ResolvedValueBinding<TActivated>,
>(
  resolveServiceNode: (
    params: ResolutionParams,
    serviceNode: PlanServiceNode,
  ) => unknown,
): (
  params: ResolutionParams,
  node: ResolvedValueBindingNode<TBinding>,
) => unknown[] | Promise<unknown[]> {
  return (
    params: ResolutionParams,
    node: ResolvedValueBindingNode<TBinding>,
  ): unknown[] | Promise<unknown[]> => {
    const paramsResolvedValues: unknown[] = [];

    for (const param of node.params) {
      paramsResolvedValues.push(resolveServiceNode(params, param));
    }

    return paramsResolvedValues.some(isPromise)
      ? Promise.all(paramsResolvedValues)
      : paramsResolvedValues;
  };
}
