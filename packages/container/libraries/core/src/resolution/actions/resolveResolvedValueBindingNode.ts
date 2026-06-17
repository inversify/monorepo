import { isPromise } from '@inversifyjs/common';

import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved } from '../models/Resolved.js';
import { resolveResolvedValueBindingParams } from './resolveResolvedValueBindingParams.js';

export function resolveResolvedValueBindingNode<
  TActivated,
  TBinding extends ResolvedValueBinding<TActivated> =
    ResolvedValueBinding<TActivated>,
>(
  params: ResolutionParams,
  node: ResolvedValueBindingNode<TBinding>,
): Resolved<TActivated> {
  const paramValues: unknown[] | Promise<unknown[]> =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolveResolvedValueBindingParams<any>(params, node);

  if (isPromise(paramValues)) {
    return paramValues.then(
      (resolvedParamValues: unknown[]): TActivated | Promise<TActivated> =>
        node.binding.factory(...resolvedParamValues),
    );
  }

  return node.binding.factory(...paramValues);
}
