import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { resolveTwo } from './resolveTwo.js';

/**
 * Same rationale as buildZeroConstructorArgumentsResolverOnCsp, but for
 * two-argument resolved value bindings. Equivalent to
 * `buildResolvedValueArgumentsResolver` with `resolveTwo`, but implemented
 * with a plain closure instead of the `Function` constructor, so it works in
 * environments enforcing a strict Content Security Policy (no
 * `unsafe-eval`).
 */
export function buildTwoResolvedValueArgumentResolverOnCsp<TActivated>(
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
  factory: (arg0: unknown, arg1: unknown) => Resolved<TActivated>,
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

    return resolveTwo(
      resolvedValue0,
      resolvedValue1,
      (
        resolvedValue0: unknown,
        resolvedValue1: unknown,
      ): Resolved<TActivated> =>
        resolveActivations(params, factory(resolvedValue0, resolvedValue1)),
    );
  };
}
