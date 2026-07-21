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
import { resolveFour } from './resolveFour.js';

/**
 * Same rationale as buildZeroConstructorArgumentsResolver, but for
 * four-argument instance bindings. Equivalent to
 * `buildConstructorArgumentsResolverJit` with `resolveFour`, but implemented
 * with a plain closure instead of the `Function` constructor, so it works in
 * environments enforcing a strict Content Security Policy (no
 * `unsafe-eval`).
 *
 * When the bound class has no properties to inject,
 * `node.classMetadata.properties` is empty and the returned `resolveNode`
 * never performs any property related check, matching the zero-property
 * fast path performance of `buildConstructorArgumentsResolverJit` with
 * `resolveFour`.
 */
export function buildFourConstructorArgumentResolver<TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
  resolveActivations?: (
    params: ResolutionParams,
    instance: Resolved<TActivated>,
  ) => Resolved<TActivated>,
): (params: ResolutionParams) => Resolved<TActivated> {
  if (node.classMetadata.properties.size === 0) {
    if (resolveActivations === undefined) {
      return function resolveNode(
        params: ResolutionParams,
      ): Resolved<TActivated> {
        const resolvedValue0: unknown = (
          node.constructorParams[0] as PlanServiceNode | ConstructorNoParamNode
        ).resolve(params);
        const resolvedValue1: unknown = (
          node.constructorParams[1] as PlanServiceNode | ConstructorNoParamNode
        ).resolve(params);
        const resolvedValue2: unknown = (
          node.constructorParams[2] as PlanServiceNode | ConstructorNoParamNode
        ).resolve(params);
        const resolvedValue3: unknown = (
          node.constructorParams[3] as PlanServiceNode | ConstructorNoParamNode
        ).resolve(params);

        return resolveFour(
          resolvedValue0,
          resolvedValue1,
          resolvedValue2,
          resolvedValue3,
          (
            resolvedValue0: unknown,
            resolvedValue1: unknown,
            resolvedValue2: unknown,
            resolvedValue3: unknown,
          ): TActivated =>
            new node.binding.implementationType(
              resolvedValue0,
              resolvedValue1,
              resolvedValue2,
              resolvedValue3,
            ),
        );
      };
    }

    return function resolveNode(
      params: ResolutionParams,
    ): Resolved<TActivated> {
      const resolvedValue0: unknown = (
        node.constructorParams[0] as PlanServiceNode | ConstructorNoParamNode
      ).resolve(params);
      const resolvedValue1: unknown = (
        node.constructorParams[1] as PlanServiceNode | ConstructorNoParamNode
      ).resolve(params);
      const resolvedValue2: unknown = (
        node.constructorParams[2] as PlanServiceNode | ConstructorNoParamNode
      ).resolve(params);
      const resolvedValue3: unknown = (
        node.constructorParams[3] as PlanServiceNode | ConstructorNoParamNode
      ).resolve(params);

      return resolveFour(
        resolvedValue0,
        resolvedValue1,
        resolvedValue2,
        resolvedValue3,
        (
          resolvedValue0: unknown,
          resolvedValue1: unknown,
          resolvedValue2: unknown,
          resolvedValue3: unknown,
        ): Resolved<TActivated> =>
          resolveActivations(
            params,
            new node.binding.implementationType(
              resolvedValue0,
              resolvedValue1,
              resolvedValue2,
              resolvedValue3,
            ),
          ),
      );
    };
  }

  if (resolveActivations === undefined) {
    const finalizeInstance: (
      params: ResolutionParams,
      instance: SyncResolved<TActivated> & Record<string | symbol, unknown>,
    ) => Resolved<TActivated> = (
      params: ResolutionParams,
      instance: SyncResolved<TActivated> & Record<string | symbol, unknown>,
    ): Resolved<TActivated> => {
      const propertiesAssignmentResult: void | Promise<void> =
        setInstanceProperties(params, instance, node);

      if (isPromise(propertiesAssignmentResult)) {
        return propertiesAssignmentResult.then((): TActivated => instance);
      }

      return instance;
    };

    return function resolveNode(
      params: ResolutionParams,
    ): Resolved<TActivated> {
      const resolvedValue0: unknown = (
        node.constructorParams[0] as PlanServiceNode | ConstructorNoParamNode
      ).resolve(params);
      const resolvedValue1: unknown = (
        node.constructorParams[1] as PlanServiceNode | ConstructorNoParamNode
      ).resolve(params);
      const resolvedValue2: unknown = (
        node.constructorParams[2] as PlanServiceNode | ConstructorNoParamNode
      ).resolve(params);
      const resolvedValue3: unknown = (
        node.constructorParams[3] as PlanServiceNode | ConstructorNoParamNode
      ).resolve(params);

      return resolveFour(
        resolvedValue0,
        resolvedValue1,
        resolvedValue2,
        resolvedValue3,
        (
          resolvedValue0: unknown,
          resolvedValue1: unknown,
          resolvedValue2: unknown,
          resolvedValue3: unknown,
        ): Resolved<TActivated> =>
          finalizeInstance(
            params,
            new node.binding.implementationType(
              resolvedValue0,
              resolvedValue1,
              resolvedValue2,
              resolvedValue3,
            ) as SyncResolved<TActivated> & Record<string | symbol, unknown>,
          ),
      );
    };
  }

  const finalizeInstance: (
    params: ResolutionParams,
    instance: SyncResolved<TActivated> & Record<string | symbol, unknown>,
  ) => Resolved<TActivated> = (
    params: ResolutionParams,
    instance: SyncResolved<TActivated> & Record<string | symbol, unknown>,
  ): Resolved<TActivated> => {
    const propertiesAssignmentResult: void | Promise<void> =
      setInstanceProperties(params, instance, node);

    if (isPromise(propertiesAssignmentResult)) {
      return propertiesAssignmentResult.then((): Resolved<TActivated> =>
        resolveActivations(params, instance),
      );
    }

    return resolveActivations(params, instance);
  };

  return function resolveNode(params: ResolutionParams): Resolved<TActivated> {
    const resolvedValue0: unknown = (
      node.constructorParams[0] as PlanServiceNode | ConstructorNoParamNode
    ).resolve(params);
    const resolvedValue1: unknown = (
      node.constructorParams[1] as PlanServiceNode | ConstructorNoParamNode
    ).resolve(params);
    const resolvedValue2: unknown = (
      node.constructorParams[2] as PlanServiceNode | ConstructorNoParamNode
    ).resolve(params);
    const resolvedValue3: unknown = (
      node.constructorParams[3] as PlanServiceNode | ConstructorNoParamNode
    ).resolve(params);

    return resolveFour(
      resolvedValue0,
      resolvedValue1,
      resolvedValue2,
      resolvedValue3,
      (
        resolvedValue0: unknown,
        resolvedValue1: unknown,
        resolvedValue2: unknown,
        resolvedValue3: unknown,
      ): Resolved<TActivated> =>
        finalizeInstance(
          params,
          new node.binding.implementationType(
            resolvedValue0,
            resolvedValue1,
            resolvedValue2,
            resolvedValue3,
          ) as SyncResolved<TActivated> & Record<string | symbol, unknown>,
        ),
    );
  };
}
