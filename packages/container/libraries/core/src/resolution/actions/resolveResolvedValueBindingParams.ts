import { isPromise } from '@inversifyjs/common';

import { ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding';
import { PlanServiceNode } from '../../planning/models/PlanServiceNode';
import { ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode';
import { ResolutionParams } from '../models/ResolutionParams';

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
