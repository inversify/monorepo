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

  const constructorValuesConcatenation: string = constructorArgumentIndexes
    .map((index: number) => `value$${index.toString()}`)
    .join(', ');
  let constructorValuesDeclarations: string = '';

  for (const index of constructorArgumentIndexes) {
    constructorValuesDeclarations += `const value$${index.toString()} = node$${id}.constructorParams[${index.toString()}].resolve(params$${id});\n`;
  }

  const propertiesArgumentsCount: number = node.classMetadata.properties.size;

  const propertiesArgumentIndexes: number[] = Array.from(
    { length: propertiesArgumentsCount },
    (_: unknown, index: number) => index,
  );

  const propertiesValuesConcatenation: string = propertiesArgumentIndexes
    .map((index: number) => `property$${index.toString()}`)
    .join(', ');

  let propertyValuesDeclarations: string = `let propertyIterator = node$${id}.propertyParams.entries();\n`;

  for (const index of propertiesArgumentIndexes) {
    propertyValuesDeclarations += `const propertyNode$${index.toString()} = propertyIterator.next().value;
  const propertyKey$${index.toString()} = propertyNode$${index.toString()}[0];
  const propertyBound$${index.toString()} = propertyNode$${index.toString()}[1].bindings !== undefined;
  const property$${index.toString()} = propertyBound$${index.toString()} ? propertyNode$${index.toString()}[1].resolve(params$${id}) : undefined;\n`;
  }

  const propertyAssignments: string = propertiesArgumentIndexes
    .map(
      (index: number): string =>
        `if (propertyBound$${index.toString()}) { instance[propertyKey$${index.toString()}] = property$${index.toString()}; }`,
    )
    .join('      \n');

  const resolveAsyncValuesArguments: string = [
    constructorValuesConcatenation,
    propertiesValuesConcatenation,
  ]
    .filter((value: string) => value.length > 0)
    .join(', ');

  const resolveAsyncValuesBuildArguments: string = resolveAsyncValuesArguments;

  if (resolveActivations === undefined) {
    const buildResolveNodeBody: string =
      propertiesArgumentsCount === 0
        ? `return function resolveNode$${id}(params$${id}) {
  ${constructorValuesDeclarations}

  return resolveAsyncValues$${id}(
    ${constructorValuesConcatenation},
    function (${constructorValuesConcatenation}) {
      return new ctor$${id}(${constructorValuesConcatenation});
    },
  );
}`
        : `return function resolveNode$${id}(params$${id}) {
  ${constructorValuesDeclarations}

  ${propertyValuesDeclarations}

  return resolveAsyncValues$${id}(
    ${resolveAsyncValuesArguments},
    function (${resolveAsyncValuesBuildArguments}) {
      const instance = new ctor$${id}(${constructorValuesConcatenation});

      ${propertyAssignments}

      return instance;
    },
  );
}`;

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
      buildResolveNodeBody,
    ) as (
      node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
      implementationType: Newable<TActivated>,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      resolveAsyncValues: Function,
    ) => (params: ResolutionParams) => Resolved<TActivated>;

    return buildResolveNode(node, implementationType, resolveAsyncValues);
  }

  const buildResolveNodeBody: string =
    propertiesArgumentsCount === 0
      ? `return function resolveNode$${id}(params$${id}) {
  ${constructorValuesDeclarations}

  return resolveAsyncValues$${id}(
    ${constructorValuesConcatenation},
    function (${constructorValuesConcatenation}) {
      return activate$${id}(
        params$${id},
        new ctor$${id}(${constructorValuesConcatenation}),
      );
    },
  );
}`
      : `return function resolveNode$${id}(params$${id}) {
  ${constructorValuesDeclarations}

  ${propertyValuesDeclarations}

  return resolveAsyncValues$${id}(
    ${resolveAsyncValuesArguments},
    function (${resolveAsyncValuesBuildArguments}) {
      const instance = new ctor$${id}(${constructorValuesConcatenation});

      ${propertyAssignments}

      return activate$${id}(
        params$${id},
        instance,
      );
    },
  );
}`;

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
    buildResolveNodeBody,
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
