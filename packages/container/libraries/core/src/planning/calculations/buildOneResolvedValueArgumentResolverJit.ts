import { isPromise } from '@inversifyjs/common';

import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { getGeneratedResolverId } from './getGeneratedResolverId.js';

export function buildOneResolvedValueArgumentResolverJit<TActivated>(
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
  resolveActivations?: (
    params: ResolutionParams,
    resolvedValue: Resolved<TActivated>,
  ) => Resolved<TActivated>,
): (params: ResolutionParams) => Resolved<TActivated> {
  const id: string = getGeneratedResolverId().toString();

  if (resolveActivations === undefined) {
    const buildResolveNode: (
      boundNode: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
      isPromiseFunction: typeof isPromise,
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
    ) => (params: ResolutionParams) => Resolved<TActivated> = new Function(
      `node$${id}`,
      `isPromise$${id}`,
      `return function resolveNode$${id}(params$${id}) {
      const resolvedValue$${id} = node$${id}.params[0].resolve(params$${id});

      if (isPromise$${id}(resolvedValue$${id})) {
        return resolvedValue$${id}.then(function (resolvedValue$${id}) {
          return node$${id}.binding.factory(resolvedValue$${id});
        });
      }

      return node$${id}.binding.factory(resolvedValue$${id});
    };`,
    ) as (
      node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
      isPromise: <TParam>(object: unknown) => object is Promise<TParam>,
    ) => (params: ResolutionParams) => Resolved<TActivated>;

    return buildResolveNode(node, isPromise);
  }

  const buildResolveNode: (
    boundNode: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
    activate: (
      params: ResolutionParams,
      resolvedValue: Resolved<TActivated>,
    ) => Resolved<TActivated>,
    isPromiseFunction: typeof isPromise,
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
  ) => (params: ResolutionParams) => Resolved<TActivated> = new Function(
    `node$${id}`,
    `activate$${id}`,
    `isPromise$${id}`,
    `return function resolveNode$${id}(params$${id}) {
      const resolvedValue$${id} = node$${id}.params[0].resolve(params$${id});

      if (isPromise$${id}(resolvedValue$${id})) {
        return resolvedValue$${id}.then(function (resolvedValue$${id}) {
          return activate$${id}(params$${id}, node$${id}.binding.factory(resolvedValue$${id}));
        });
      }

      return activate$${id}(params$${id}, node$${id}.binding.factory(resolvedValue$${id}));
    };`,
  ) as (
    node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
    resolveActivations: (
      params: ResolutionParams,
      resolvedValue: Resolved<TActivated>,
    ) => Resolved<TActivated>,
    isPromise: <TParam>(object: unknown) => object is Promise<TParam>,
  ) => (params: ResolutionParams) => Resolved<TActivated>;

  return buildResolveNode(node, resolveActivations, isPromise);
}
