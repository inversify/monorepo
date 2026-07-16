import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';

/**
 * Same rationale as buildZeroConstructorArgumentsResolverOnCsp, but for
 * zero-argument resolved value bindings. Equivalent to
 * `buildZeroResolvedValueArgumentsResolver`, but implemented with a plain
 * closure instead of the `Function` constructor, so it works in
 * environments enforcing a strict Content Security Policy (no
 * `unsafe-eval`).
 */
export function buildZeroResolvedValueArgumentsResolverOnCsp<TActivated>(
  factory: () => Resolved<TActivated>,
  resolveActivations: (
    params: ResolutionParams,
    resolvedValue: Resolved<TActivated>,
  ) => Resolved<TActivated>,
): (params: ResolutionParams) => Resolved<TActivated> {
  return function resolveNode(params: ResolutionParams): Resolved<TActivated> {
    return resolveActivations(params, factory());
  };
}
