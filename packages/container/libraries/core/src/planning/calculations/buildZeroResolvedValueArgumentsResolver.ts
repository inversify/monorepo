import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';

/**
 * Same rationale as buildZeroConstructorArgumentsResolver, but for
 * zero-argument resolved value bindings. Equivalent to
 * `buildZeroResolvedValueArgumentsResolverJit`, but implemented with a plain
 * closure instead of the `Function` constructor, so it works in
 * environments enforcing a strict Content Security Policy (no
 * `unsafe-eval`).
 */
export function buildZeroResolvedValueArgumentsResolver<TActivated>(
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
  resolveActivations?: (
    params: ResolutionParams,
    resolvedValue: Resolved<TActivated>,
  ) => Resolved<TActivated>,
): (params: ResolutionParams) => Resolved<TActivated> {
  if (resolveActivations === undefined) {
    return function resolveNode(
      _params: ResolutionParams,
    ): Resolved<TActivated> {
      return node.binding.factory();
    };
  }

  return function resolveNode(params: ResolutionParams): Resolved<TActivated> {
    return resolveActivations(params, node.binding.factory());
  };
}
