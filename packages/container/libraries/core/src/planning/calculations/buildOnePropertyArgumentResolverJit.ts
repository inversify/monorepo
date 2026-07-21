import { isPromise, type Newable } from '@inversifyjs/common';

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { getGeneratedResolverId } from './getGeneratedResolverId.js';

/**
 * Same rationale as buildOneConstructorArgumentResolverJit, but
 * for zero-argument instance bindings with one property.
 */
export function buildOnePropertyArgumentResolverJit<TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
  implementationType: Newable<TActivated>,
  resolveActivations?: (
    params: ResolutionParams,
    instance: Resolved<TActivated>,
  ) => Resolved<TActivated>,
): (params: ResolutionParams) => Resolved<TActivated> {
  const id: string = getGeneratedResolverId().toString();

  if (resolveActivations === undefined) {
    const buildResolveNode: (
      boundNode: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
      ctor: Newable<TActivated>,
      isPromiseFunction: typeof isPromise,
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
    ) => (params: ResolutionParams) => Resolved<TActivated> = new Function(
      `node$${id}`,
      `ctor$${id}`,
      `isPromise$${id}`,
      `return function resolveNode$${id}(params$${id}) {
        const propertyEntry$${id} = node$${id}.propertyParams.entries().next().value;
        const propertyKey$${id} = propertyEntry$${id}[0];
        const instance$${id} = new ctor$${id}();

        if (propertyEntry$${id}[1].bindings === undefined) {
          return instance$${id};
        }

        const resolvedValue$${id} = propertyEntry$${id}[1].resolve(params$${id});

        if (isPromise$${id}(resolvedValue$${id})) {
          return resolvedValue$${id}.then(function (resolvedValue$${id}) {
            instance$${id}[propertyKey$${id}] = resolvedValue$${id};
            return instance$${id};
          });
        }

        instance$${id}[propertyKey$${id}] = resolvedValue$${id};
        return instance$${id};
      };`,
    ) as (
      node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
      implementationType: Newable<TActivated>,
      isPromise: <TParam>(object: unknown) => object is Promise<TParam>,
    ) => (params: ResolutionParams) => Resolved<TActivated>;

    return buildResolveNode(node, implementationType, isPromise);
  }

  const buildResolveNode: (
    boundNode: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
    ctor: Newable<TActivated>,
    activate: (
      params: ResolutionParams,
      instance: Resolved<TActivated>,
    ) => Resolved<TActivated>,
    isPromiseFunction: typeof isPromise,
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
  ) => (params: ResolutionParams) => Resolved<TActivated> = new Function(
    `node$${id}`,
    `ctor$${id}`,
    `activate$${id}`,
    `isPromise$${id}`,
    `return function resolveNode$${id}(params$${id}) {
        const propertyEntry$${id} = node$${id}.propertyParams.entries().next().value;
        const propertyKey$${id} = propertyEntry$${id}[0];
        const instance$${id} = new ctor$${id}();

        if (propertyEntry$${id}[1].bindings === undefined) {
          return activate$${id}(params$${id}, instance$${id});
        }

        const resolvedValue$${id} = propertyEntry$${id}[1].resolve(params$${id});

        if (isPromise$${id}(resolvedValue$${id})) {
          return resolvedValue$${id}.then(function (resolvedValue$${id}) {
            instance$${id}[propertyKey$${id}] = resolvedValue$${id};
            return activate$${id}(params$${id}, instance$${id});
          });
        }

        instance$${id}[propertyKey$${id}] = resolvedValue$${id};
        return activate$${id}(params$${id}, instance$${id});
      };`,
  ) as (
    node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
    implementationType: Newable<TActivated>,
    resolveActivations: (
      params: ResolutionParams,
      instance: Resolved<TActivated>,
    ) => Resolved<TActivated>,
    isPromise: <TParam>(object: unknown) => object is Promise<TParam>,
  ) => (params: ResolutionParams) => Resolved<TActivated>;

  return buildResolveNode(
    node,
    implementationType,
    resolveActivations,
    isPromise,
  );
}
