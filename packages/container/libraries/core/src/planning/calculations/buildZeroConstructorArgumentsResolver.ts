import { type Newable } from '@inversifyjs/common';

import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import {
  type Resolved,
  type SyncResolved,
} from '../../resolution/models/Resolved.js';
import { getGeneratedResolverId } from './getGeneratedResolverId.js';

/**
 * Builds a `resolveNode` for a zero-argument instance binding by generating
 * a brand new function via the `Function` constructor for every binding.
 *
 * This is not just an inlining trick: the `Function` constructor result is
 * cached by V8 keyed on the *exact source text* passed to it. If every
 * binding generated the exact same source text (e.g. always naming the
 * constructor parameter `ctor`), V8 would transparently reuse the very same
 * compiled function (and its feedback vector) for every binding sharing
 * this code path. Since that single shared `new ctor()` call site would
 * then observe a different class on every binding, its type feedback would
 * become polymorphic/megamorphic across all of them, defeating the purpose
 * of generating specialized code and forcing V8 back to the generic,
 * non-inlined construction path.
 *
 * Suffixing every identifier with a per-binding id keeps the source text
 * (and therefore the compiled function and its feedback) unique per
 * binding, so the `new ctor()` call site stays monomorphic and V8 can
 * inline/optimize it as if it had been hand-written for that one class.
 */
export function buildZeroConstructorArgumentsResolver<TActivated>(
  implementationType: Newable<TActivated>,
  resolveActivations: (
    params: ResolutionParams,
    instance: SyncResolved<TActivated>,
  ) => Resolved<TActivated>,
): (params: ResolutionParams) => Resolved<TActivated> {
  const id: string = getGeneratedResolverId().toString();

  const buildResolveNode: (
    ctor: Newable<TActivated>,
    activate: (
      params: ResolutionParams,
      instance: SyncResolved<TActivated>,
    ) => Resolved<TActivated>,
  ) => (params: ResolutionParams) => Resolved<TActivated> =
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function(
      `ctor$${id}`,
      `activate$${id}`,
      `return function resolveNode$${id}(params$${id}) {
        return activate$${id}(params$${id}, new ctor$${id}());
      };`,
    ) as (
      implementationType: Newable<TActivated>,
      resolveActivations: (
        params: ResolutionParams,
        instance: SyncResolved<TActivated>,
      ) => Resolved<TActivated>,
    ) => (params: ResolutionParams) => Resolved<TActivated>;

  return buildResolveNode(implementationType, resolveActivations);
}
