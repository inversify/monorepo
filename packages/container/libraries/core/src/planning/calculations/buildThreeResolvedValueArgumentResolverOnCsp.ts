import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { resolveThree } from './resolveThree.js';

/**
 * Same rationale as buildZeroConstructorArgumentsResolverOnCsp, but for
 * three-argument resolved value bindings. Equivalent to
 * `buildResolvedValueArgumentsResolver` with `resolveThree`, but implemented
 * with a plain closure instead of the `Function` constructor, so it works in
 * environments enforcing a strict Content Security Policy (no
 * `unsafe-eval`).
 */
export function buildThreeResolvedValueArgumentResolverOnCsp<TActivated>(
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
  factory: (
    arg0: unknown,
    arg1: unknown,
    arg2: unknown,
  ) => Resolved<TActivated>,
  resolveActivations: (
    params: ResolutionParams,
    resolvedValue: Resolved<TActivated>,
  ) => Resolved<TActivated>,
): (params: ResolutionParams) => Resolved<TActivated> {
  return function resolveNode(params: ResolutionParams): Resolved<TActivated> {
    const resolvedValue0: unknown = (node.params[0] as PlanServiceNode).resolve(
      params,
    );
    const resolvedValue1: unknown = (node.params[1] as PlanServiceNode).resolve(
      params,
    );
    const resolvedValue2: unknown = (node.params[2] as PlanServiceNode).resolve(
      params,
    );

    return resolveThree(
      resolvedValue0,
      resolvedValue1,
      resolvedValue2,
      (
        resolvedValue0: unknown,
        resolvedValue1: unknown,
        resolvedValue2: unknown,
      ): Resolved<TActivated> =>
        resolveActivations(
          params,
          factory(resolvedValue0, resolvedValue1, resolvedValue2),
        ),
    );
  };
}
