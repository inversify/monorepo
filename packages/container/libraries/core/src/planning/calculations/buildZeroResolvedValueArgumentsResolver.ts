import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { getGeneratedResolverId } from './getGeneratedResolverId.js';

export function buildZeroResolvedValueArgumentsResolver<TActivated>(
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
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
    ) => (params: ResolutionParams) => Resolved<TActivated> = new Function(
      `node$${id}`,
      `return function resolveNode$${id}(params$${id}) {
      return node$${id}.binding.factory();
    };`,
    ) as (
      node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
    ) => (params: ResolutionParams) => Resolved<TActivated>;

    return buildResolveNode(node);
  }

  const buildResolveNode: (
    boundNode: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
    activate: (
      params: ResolutionParams,
      resolvedValue: Resolved<TActivated>,
    ) => Resolved<TActivated>,
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
  ) => (params: ResolutionParams) => Resolved<TActivated> = new Function(
    `node$${id}`,
    `activate$${id}`,
    `return function resolveNode$${id}(params$${id}) {
      return activate$${id}(params$${id}, node$${id}.binding.factory());
    };`,
  ) as (
    node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
    resolveActivations: (
      params: ResolutionParams,
      resolvedValue: Resolved<TActivated>,
    ) => Resolved<TActivated>,
  ) => (params: ResolutionParams) => Resolved<TActivated>;

  return buildResolveNode(node, resolveActivations);
}
