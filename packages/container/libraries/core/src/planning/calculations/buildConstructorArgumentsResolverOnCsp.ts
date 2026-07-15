import { isPromise } from '@inversifyjs/common';

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { setInstanceProperties } from '../../resolution/actions/setInstanceProperties.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import {
  type Resolved,
  type SyncResolved,
} from '../../resolution/models/Resolved.js';
import { type ConstructorNoParamNode } from '../models/ConstructorNoParamNode.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';

/**
 * Same rationale as buildZeroConstructorArgumentsResolverOnCsp, but for
 * instance bindings with two or more constructor arguments. Equivalent to
 * `buildConstructorArgumentsResolver`, but implemented with a plain closure
 * instead of the `Function` constructor, so it works in environments
 * enforcing a strict Content Security Policy (no `unsafe-eval`).
 *
 * When the bound class has no properties to inject,
 * `node.classMetadata.properties` is empty and the returned `resolveNode`
 * never performs any property related check, matching the zero-property
 * fast path performance of `buildConstructorArgumentsResolver`.
 */
export function buildConstructorArgumentsResolverOnCsp<TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  resolveAsyncValues: Function,
  resolveActivations?: (
    params: ResolutionParams,
    instance: Resolved<TActivated>,
  ) => Resolved<TActivated>,
): (params: ResolutionParams) => Resolved<TActivated> {
  const constructorArgumentsCount: number =
    node.classMetadata.constructorArguments.length;

  function resolveConstructorValues(params: ResolutionParams): unknown[] {
    const values: unknown[] = new Array<unknown>(constructorArgumentsCount);

    for (let index: number = 0; index < constructorArgumentsCount; index++) {
      values[index] = (
        node.constructorParams[index] as
          PlanServiceNode | ConstructorNoParamNode
      ).resolve(params);
    }

    return values;
  }

  if (node.classMetadata.properties.size === 0) {
    if (resolveActivations === undefined) {
      return function resolveNode(
        params: ResolutionParams,
      ): Resolved<TActivated> {
        const values: unknown[] = resolveConstructorValues(params);

        function build(...resolvedValues: unknown[]): TActivated {
          return new node.binding.implementationType(...resolvedValues);
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
        return resolveAsyncValues(...values, build);
      };
    }

    return function resolveNode(
      params: ResolutionParams,
    ): Resolved<TActivated> {
      const values: unknown[] = resolveConstructorValues(params);

      const build: (...resolvedValues: unknown[]) => Resolved<TActivated> = (
        ...resolvedValues: unknown[]
      ): Resolved<TActivated> =>
        resolveActivations(
          params,
          new node.binding.implementationType(...resolvedValues),
        );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
      return resolveAsyncValues(...values, build);
    };
  }

  if (resolveActivations === undefined) {
    return function resolveNode(
      params: ResolutionParams,
    ): Resolved<TActivated> {
      const values: unknown[] = resolveConstructorValues(params);

      function build(...resolvedValues: unknown[]): Resolved<TActivated> {
        const instance: SyncResolved<TActivated> &
          Record<string | symbol, unknown> =
          new node.binding.implementationType(
            ...resolvedValues,
          ) as SyncResolved<TActivated> & Record<string | symbol, unknown>;

        const propertiesAssignmentResult: void | Promise<void> =
          setInstanceProperties(params, instance, node);

        if (isPromise(propertiesAssignmentResult)) {
          return propertiesAssignmentResult.then((): TActivated => instance);
        }

        return instance;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
      return resolveAsyncValues(...values, build);
    };
  }

  return function resolveNode(params: ResolutionParams): Resolved<TActivated> {
    const values: unknown[] = resolveConstructorValues(params);

    const build: (...resolvedValues: unknown[]) => Resolved<TActivated> = (
      ...resolvedValues: unknown[]
    ): Resolved<TActivated> => {
      const instance: SyncResolved<TActivated> &
        Record<string | symbol, unknown> = new node.binding.implementationType(
        ...resolvedValues,
      ) as SyncResolved<TActivated> & Record<string | symbol, unknown>;

      const propertiesAssignmentResult: void | Promise<void> =
        setInstanceProperties(params, instance, node);

      if (isPromise(propertiesAssignmentResult)) {
        return propertiesAssignmentResult.then((): Resolved<TActivated> =>
          resolveActivations(params, instance),
        );
      }

      return resolveActivations(params, instance);
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
    return resolveAsyncValues(...values, build);
  };
}
