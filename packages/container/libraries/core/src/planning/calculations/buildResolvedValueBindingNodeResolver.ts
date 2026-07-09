import { isPromise, type ServiceIdentifier } from '@inversifyjs/common';

import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { resolveBindingServiceActivations } from '../../resolution/actions/resolveBindingServiceActivations.js';
import { resolveResolvedValueBindingNode } from '../../resolution/actions/resolveResolvedValueBindingNode.js';
import { resolveScoped } from '../../resolution/actions/resolveScoped.js';
import { resolveScopedWithNoActivations } from '../../resolution/actions/resolveScopedWithNoActivations.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { resolveFour } from './resolveFour.js';
import { resolveThree } from './resolveThree.js';
import { resolveTwo } from './resolveTwo.js';

const ZERO_PARAMS: number = 0;
const ONE_PARAM: number = 1;
const TWO_PARAMS: number = 2;
const THREE_PARAMS: number = 3;
const FOUR_PARAMS: number = 4;

const resolveScopedResolvedValueBindingNode: <TActivated>(
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
) => (params: ResolutionParams) => Resolved<TActivated> = <TActivated>(
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
) =>
  resolveScoped<
    TActivated,
    typeof bindingTypeValues.ResolvedValue,
    ResolvedValueBinding<TActivated>,
    ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>
  >(node, resolveResolvedValueBindingNode);

function buildSimpleResolvedValueBindingNodeResolver<TActivated>(
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
): (params: ResolutionParams) => Resolved<TActivated> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const factory: (...args: any[]) => Resolved<TActivated> =
    node.binding.factory;
  const serviceIdentifier: ServiceIdentifier<TActivated> =
    node.binding.serviceIdentifier;

  function resolveActivations(
    params: ResolutionParams,
    resolvedValue: Resolved<TActivated>,
  ): Resolved<TActivated> {
    if (params.getActivations(serviceIdentifier) === undefined) {
      return resolvedValue;
    }

    return resolveBindingServiceActivations<TActivated>(
      params,
      serviceIdentifier,
      resolvedValue,
    );
  }

  let resolveNode: (params: ResolutionParams) => Resolved<TActivated>;

  switch (node.binding.metadata.arguments.length) {
    case ZERO_PARAMS:
      resolveNode = (params: ResolutionParams): Resolved<TActivated> =>
        resolveActivations(params, factory());
      break;
    case ONE_PARAM:
      resolveNode = (params: ResolutionParams): Resolved<TActivated> => {
        const resolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.params[0]!.resolve(params);

        if (isPromise(resolvedValue)) {
          return resolvedValue.then(
            (resolvedValue: unknown): Resolved<TActivated> =>
              resolveActivations(params, factory(resolvedValue)),
          );
        }

        return resolveActivations(params, factory(resolvedValue));
      };
      break;
    case TWO_PARAMS:
      resolveNode = (params: ResolutionParams): Resolved<TActivated> => {
        const firstResolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.params[0]!.resolve(params);
        const secondResolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.params[1]!.resolve(params);

        return resolveTwo(
          firstResolvedValue,
          secondResolvedValue,
          (
            resolvedFirstValue: unknown,
            resolvedSecondValue: unknown,
          ): Resolved<TActivated> =>
            resolveActivations(
              params,
              factory(resolvedFirstValue, resolvedSecondValue),
            ),
        );
      };
      break;
    case THREE_PARAMS:
      resolveNode = (params: ResolutionParams): Resolved<TActivated> => {
        const firstResolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.params[0]!.resolve(params);
        const secondResolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.params[1]!.resolve(params);
        const thirdResolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.params[2]!.resolve(params);

        return resolveThree(
          firstResolvedValue,
          secondResolvedValue,
          thirdResolvedValue,
          (
            resolvedFirstValue: unknown,
            resolvedSecondValue: unknown,
            resolvedThirdValue: unknown,
          ): Resolved<TActivated> =>
            resolveActivations(
              params,
              factory(
                resolvedFirstValue,
                resolvedSecondValue,
                resolvedThirdValue,
              ),
            ),
        );
      };
      break;
    case FOUR_PARAMS:
      resolveNode = (params: ResolutionParams): Resolved<TActivated> => {
        const firstResolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.params[0]!.resolve(params);
        const secondResolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.params[1]!.resolve(params);
        const thirdResolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.params[2]!.resolve(params);
        const fourthResolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.params[3]!.resolve(params);

        return resolveFour(
          firstResolvedValue,
          secondResolvedValue,
          thirdResolvedValue,
          fourthResolvedValue,
          (
            resolvedFirstValue: unknown,
            resolvedSecondValue: unknown,
            resolvedThirdValue: unknown,
            resolvedFourthValue: unknown,
          ): Resolved<TActivated> =>
            resolveActivations(
              params,
              factory(
                resolvedFirstValue,
                resolvedSecondValue,
                resolvedThirdValue,
                resolvedFourthValue,
              ),
            ),
        );
      };
      break;
    default:
      resolveNode = (params: ResolutionParams): Resolved<TActivated> =>
        resolveActivations(
          params,
          resolveResolvedValueBindingNode(params, node),
        );
  }

  return resolveScopedWithNoActivations(node.binding, resolveNode);
}

export function buildResolvedValueBindingNodeResolver<TActivated>(
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
): (params: ResolutionParams) => Resolved<TActivated> {
  if (node.binding.onActivation === undefined) {
    return buildSimpleResolvedValueBindingNodeResolver(node);
  }

  return resolveScopedResolvedValueBindingNode(node);
}
