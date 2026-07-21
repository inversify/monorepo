import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { resolveTwo } from './resolveTwo.js';

/**
 * Same rationale as buildZeroConstructorArgumentsResolver, but for
 * two-argument resolved value bindings. Equivalent to
 * `buildResolvedValueArgumentsResolverJit` with `resolveTwo`, but implemented
 * with a plain closure instead of the `Function` constructor, so it works in
 * environments enforcing a strict Content Security Policy (no
 * `unsafe-eval`).
 */
export function buildTwoResolvedValueArgumentResolver<TActivated>(
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
  resolveActivations?: (
    params: ResolutionParams,
    resolvedValue: Resolved<TActivated>,
  ) => Resolved<TActivated>,
): (params: ResolutionParams) => Resolved<TActivated> {
  if (resolveActivations === undefined) {
    return function resolveNode(
      params: ResolutionParams,
    ): Resolved<TActivated> {
      const resolvedValue0: unknown = (
        node.params[0] as PlanServiceNode
      ).resolve(params);
      const resolvedValue1: unknown = (
        node.params[1] as PlanServiceNode
      ).resolve(params);

      return resolveTwo(
        resolvedValue0,
        resolvedValue1,
        (
          resolvedValue0: unknown,
          resolvedValue1: unknown,
        ): Resolved<TActivated> =>
          node.binding.factory(resolvedValue0, resolvedValue1),
      );
    };
  }

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
        resolveActivations(
          params,
          node.binding.factory(resolvedValue0, resolvedValue1),
        ),
    );
  };
}
