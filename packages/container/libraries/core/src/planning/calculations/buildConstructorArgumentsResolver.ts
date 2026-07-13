import { type Newable } from '@inversifyjs/common';

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { getGeneratedResolverId } from './getGeneratedResolverId.js';

export function buildConstructorArgumentsResolver<TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
  implementationType: Newable<TActivated>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  resolveAsyncValues: Function,
  resolveActivations?: (
    params: ResolutionParams,
    instance: Resolved<TActivated>,
  ) => Resolved<TActivated>,
): (params: ResolutionParams) => Resolved<TActivated> {
  const id: string = getGeneratedResolverId().toString();

  const constructorArgumentsCount: number =
    node.classMetadata.constructorArguments.length;

  const constructorArgumentIndexes: number[] = Array.from(
    { length: constructorArgumentsCount },
    (_: unknown, index: number) => index,
  );

  const resolveValueConcatenation: string = constructorArgumentIndexes
    .map((index: number) => `value$${index.toString()}`)
    .join(', ');
  let resolveValueDeclarations: string = '';

  for (const index of constructorArgumentIndexes) {
    resolveValueDeclarations += `const value$${index.toString()} = node$${id}.constructorParams[${index.toString()}].resolve(params$${id});\n`;
  }

  if (resolveActivations === undefined) {
    const buildResolveNode: (
      boundNode: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
      ctor: Newable<TActivated>,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      resolveAsyncValues: Function,
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
    ) => (params: ResolutionParams) => Resolved<TActivated> = new Function(
      `node$${id}`,
      `ctor$${id}`,
      `resolveAsyncValues$${id}`,
      `return function resolveNode$${id}(params$${id}) {
  ${resolveValueDeclarations}

  return resolveAsyncValues$${id}(
    ${resolveValueConcatenation},
    function (${resolveValueConcatenation}) {
      return new ctor$${id}(${resolveValueConcatenation});
    },
  );
}`,
    ) as (
      node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
      implementationType: Newable<TActivated>,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      resolveAsyncValues: Function,
    ) => (params: ResolutionParams) => Resolved<TActivated>;

    return buildResolveNode(node, implementationType, resolveAsyncValues);
  }

  const buildResolveNode: (
    boundNode: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
    ctor: Newable<TActivated>,
    activate: (
      params: ResolutionParams,
      instance: Resolved<TActivated>,
    ) => Resolved<TActivated>,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    resolveAsyncValues: Function,
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
  ) => (params: ResolutionParams) => Resolved<TActivated> = new Function(
    `node$${id}`,
    `ctor$${id}`,
    `activate$${id}`,
    `resolveAsyncValues$${id}`,
    `return function resolveNode$${id}(params$${id}) {
  ${resolveValueDeclarations}

  return resolveAsyncValues$${id}(
    ${resolveValueConcatenation},
    function (${resolveValueConcatenation}) {
      return activate$${id}(
        params$${id},
        new ctor$${id}(${resolveValueConcatenation}),
      );
    },
  );
}`,
  ) as (
    node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
    implementationType: Newable<TActivated>,
    resolveActivations: (
      params: ResolutionParams,
      instance: Resolved<TActivated>,
    ) => Resolved<TActivated>,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    resolveAsyncValues: Function,
  ) => (params: ResolutionParams) => Resolved<TActivated>;

  return buildResolveNode(
    node,
    implementationType,
    resolveActivations,
    resolveAsyncValues,
  );
}
