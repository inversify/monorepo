import { isPromise } from '@inversifyjs/common';

import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved } from '../models/Resolved.js';

export function resolveResolvedValueBindingNode<
  TActivated,
  TBinding extends ResolvedValueBinding<TActivated> =
    ResolvedValueBinding<TActivated>,
>(
  resolveResolvedValueBindingParams: (
    params: ResolutionParams,
    node: ResolvedValueBindingNode<TBinding>,
  ) => unknown[] | Promise<unknown[]>,
): (
  params: ResolutionParams,
  node: ResolvedValueBindingNode<TBinding>,
) => Resolved<TActivated> {
  return (
    params: ResolutionParams,
    node: ResolvedValueBindingNode<TBinding>,
  ): Resolved<TActivated> => {
    const paramValues: unknown[] | Promise<unknown[]> =
      resolveResolvedValueBindingParams(params, node);

    if (isPromise(paramValues)) {
      return paramValues.then(
        (resolvedParamValues: unknown[]): TActivated | Promise<TActivated> =>
          node.binding.factory(...resolvedParamValues),
      );
    }

    return node.binding.factory(...paramValues);
  };
}
