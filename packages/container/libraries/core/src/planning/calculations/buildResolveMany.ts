import { isPromise } from '@inversifyjs/common';

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { getGeneratedResolverId } from './getGeneratedResolverId.js';

export function buildResolveMany<TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
): Function {
  const id: string = getGeneratedResolverId().toString();

  const argumentsCount: number =
    node.classMetadata.constructorArguments.length +
    node.classMetadata.properties.size;

  const argumentIndexes: number[] = Array.from(
    { length: argumentsCount },
    (_: unknown, index: number) => index,
  );

  const valueConcatenation: string = argumentIndexes
    .map((index: number) => `value$${index.toString()}`)
    .join(', ');

  const resolvedValueConcatenation: string = argumentIndexes
    .map((index: number) => `resolvedValue$${index.toString()}`)
    .join(', ');

  const parametersConcatenation: string = [valueConcatenation, `build$${id}`]
    .filter((value: string) => value.length > 0)
    .join(', ');

  const isPromiseChecks: string =
    argumentIndexes
      .map((index: number) => `isPromise$${id}(value$${index.toString()})`)
      .join(' || ') || 'false';

  const buildResolveManyFunction: (
    isPromiseFunction: typeof isPromise,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-implied-eval
  ) => Function = new Function(
    `isPromise$${id}`,
    `return function resolveMany$${id}(${parametersConcatenation}) {
  if (${isPromiseChecks}) {
    return Promise.all([${valueConcatenation}]).then(
      function ([${resolvedValueConcatenation}]) {
        return build$${id}(${resolvedValueConcatenation});
      },
    );
  }

  return build$${id}(${valueConcatenation});
};`,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  ) as (isPromiseFunction: typeof isPromise) => Function;

  return buildResolveManyFunction(isPromise);
}
