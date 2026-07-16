import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';

/**
 * Same rationale as buildZeroConstructorArgumentsResolverOnCsp, but for
 * resolved value bindings with two or more arguments. Equivalent to
 * `buildResolvedValueArgumentsResolver`, but implemented with a plain
 * closure instead of the `Function` constructor, so it works in
 * environments enforcing a strict Content Security Policy (no
 * `unsafe-eval`).
 */
export function buildResolvedValueArgumentsResolverOnCsp<TActivated>(
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
  resolveActivations: (
    params: ResolutionParams,
    resolvedValue: Resolved<TActivated>,
  ) => Resolved<TActivated>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  resolveAsyncValues: Function,
): (params: ResolutionParams) => Resolved<TActivated> {
  const argumentsCount: number = node.binding.metadata.arguments.length;

  return function resolveNode(params: ResolutionParams): Resolved<TActivated> {
    const values: unknown[] = new Array<unknown>(argumentsCount);

    for (let index: number = 0; index < argumentsCount; index++) {
      values[index] = (node.params[index] as PlanServiceNode).resolve(params);
    }

    function build(...resolvedValues: unknown[]): Resolved<TActivated> {
      return resolveActivations(
        params,
        node.binding.factory(...resolvedValues),
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
    return resolveAsyncValues(...values, build);
  };
}
