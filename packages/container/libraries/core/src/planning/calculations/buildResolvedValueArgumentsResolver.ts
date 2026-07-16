import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { getGeneratedResolverId } from './getGeneratedResolverId.js';

export function buildResolvedValueArgumentsResolver<TActivated>(
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
  resolveActivations: (
    params: ResolutionParams,
    resolvedValue: Resolved<TActivated>,
  ) => Resolved<TActivated>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  resolveAsyncValues: Function,
): (params: ResolutionParams) => Resolved<TActivated> {
  const id: string = getGeneratedResolverId().toString();
  const argumentIndexes: number[] = Array.from(
    { length: node.binding.metadata.arguments.length },
    (_: unknown, index: number) => index,
  );
  const resolvedValueConcatenation: string = argumentIndexes
    .map((index: number) => `value$${index.toString()}`)
    .join(', ');
  let resolvedValueDeclarations: string = '';

  for (const index of argumentIndexes) {
    resolvedValueDeclarations += `const value$${index.toString()} = node$${id}.params[${index.toString()}].resolve(params$${id});\n`;
  }

  const buildResolveNode: (
    boundNode: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
    activate: (
      params: ResolutionParams,
      resolvedValue: Resolved<TActivated>,
    ) => Resolved<TActivated>,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    resolveAsyncValues: Function,
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
  ) => (params: ResolutionParams) => Resolved<TActivated> = new Function(
    `node$${id}`,
    `activate$${id}`,
    `resolveAsyncValues$${id}`,
    `return function resolveNode$${id}(params$${id}) {
  ${resolvedValueDeclarations}

  return resolveAsyncValues$${id}(
    ${resolvedValueConcatenation},
    function (${resolvedValueConcatenation}) {
      return activate$${id}(
        params$${id},
        node$${id}.binding.factory(${resolvedValueConcatenation}),
      );
    },
  );
}`,
  ) as (
    node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
    resolveActivations: (
      params: ResolutionParams,
      resolvedValue: Resolved<TActivated>,
    ) => Resolved<TActivated>,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    resolveAsyncValues: Function,
  ) => (params: ResolutionParams) => Resolved<TActivated>;

  return buildResolveNode(node, resolveActivations, resolveAsyncValues);
}
