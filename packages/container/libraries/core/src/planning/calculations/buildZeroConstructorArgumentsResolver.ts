import { isPromise } from '@inversifyjs/common';

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { setInstanceProperties } from '../../resolution/actions/setInstanceProperties.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import {
  type Resolved,
  type SyncResolved,
} from '../../resolution/models/Resolved.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';

/**
 * Builds a `resolveNode` for a zero-argument instance binding without
 * relying on the `Function` constructor.
 *
 * `buildZeroConstructorArgumentsResolverJit` generates a brand new function
 * from source text for every binding to keep the `new ctor()` call site
 * monomorphic in V8's eyes. That approach requires `unsafe-eval` (or an
 * equivalent CSP trusted types allowance), so it cannot be used in
 * environments enforcing a strict Content Security Policy.
 *
 * This function provides the same behavior using a plain closure instead,
 * so it works under CSP restrictions at the cost of the per-binding
 * monomorphic optimization described above.
 *
 * When the bound class has no properties to inject,
 * `node.classMetadata.properties` is empty and the returned `resolveNode`
 * never performs any property related check, matching the zero-property
 * fast path performance of `buildZeroConstructorArgumentsResolverJit`.
 */
export function buildZeroConstructorArgumentsResolver<TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
  resolveActivations?: (
    params: ResolutionParams,
    instance: Resolved<TActivated>,
  ) => Resolved<TActivated>,
): (params: ResolutionParams) => Resolved<TActivated> {
  if (node.classMetadata.properties.size === 0) {
    if (resolveActivations === undefined) {
      return function resolveNode(
        _params: ResolutionParams,
      ): Resolved<TActivated> {
        return new node.binding.implementationType();
      };
    }

    return function resolveNode(
      params: ResolutionParams,
    ): Resolved<TActivated> {
      return resolveActivations(params, new node.binding.implementationType());
    };
  }

  if (resolveActivations === undefined) {
    return function resolveNode(
      params: ResolutionParams,
    ): Resolved<TActivated> {
      const instance: SyncResolved<TActivated> &
        Record<string | symbol, unknown> =
        new node.binding.implementationType() as SyncResolved<TActivated> &
          Record<string | symbol, unknown>;

      const propertiesAssignmentResult: void | Promise<void> =
        setInstanceProperties(params, instance, node);

      if (isPromise(propertiesAssignmentResult)) {
        return propertiesAssignmentResult.then((): TActivated => instance);
      }

      return instance;
    };
  }

  return function resolveNode(params: ResolutionParams): Resolved<TActivated> {
    const instance: SyncResolved<TActivated> &
      Record<string | symbol, unknown> =
      new node.binding.implementationType() as SyncResolved<TActivated> &
        Record<string | symbol, unknown>;

    const propertiesAssignmentResult: void | Promise<void> =
      setInstanceProperties(params, instance, node);

    if (isPromise(propertiesAssignmentResult)) {
      return propertiesAssignmentResult.then((): Resolved<TActivated> =>
        resolveActivations(params, instance),
      );
    }

    return resolveActivations(params, instance);
  };
}
