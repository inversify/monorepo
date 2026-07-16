import { isPromise } from '@inversifyjs/common';

import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';

/**
 * Same rationale as buildZeroConstructorArgumentsResolverOnCsp, but for
 * one-argument resolved value bindings. Equivalent to
 * `buildOneResolvedValueArgumentResolver`, but implemented with a plain
 * closure instead of the `Function` constructor, so it works in
 * environments enforcing a strict Content Security Policy (no
 * `unsafe-eval`).
 */
export function buildOneResolvedValueArgumentResolverOnCsp<TActivated>(
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
  resolveActivations: (
    params: ResolutionParams,
    resolvedValue: Resolved<TActivated>,
  ) => Resolved<TActivated>,
): (params: ResolutionParams) => Resolved<TActivated> {
  return function resolveNode(params: ResolutionParams): Resolved<TActivated> {
    const resolvedValue: unknown = (node.params[0] as PlanServiceNode).resolve(
      params,
    );

    if (isPromise(resolvedValue)) {
      return resolvedValue.then(
        (resolvedValue: unknown): Resolved<TActivated> =>
          resolveActivations(params, node.binding.factory(resolvedValue)),
      );
    }

    return resolveActivations(params, node.binding.factory(resolvedValue));
  };
}
