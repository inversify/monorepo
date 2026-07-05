import {
  isPromise,
  type Newable,
  type ServiceIdentifier,
} from '@inversifyjs/common';

import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { resolveBindingServiceActivations } from '../../resolution/actions/resolveBindingServiceActivations.js';
import { resolveInstanceBindingConstructorParams } from '../../resolution/actions/resolveInstanceBindingConstructorParams.js';
import { resolveInstanceBindingNode as curryResolveInstanceBindingNode } from '../../resolution/actions/resolveInstanceBindingNode.js';
import {
  resolveInstanceBindingNodeAsyncFromConstructorParams,
  resolveInstanceBindingNodeAsyncFromOnlyConstructorParams,
} from '../../resolution/actions/resolveInstanceBindingNodeAsyncFromConstructorParams.js';
import { resolveInstanceBindingNodeFromConstructorParams } from '../../resolution/actions/resolveInstanceBindingNodeFromConstructorParams.js';
import { resolveScoped } from '../../resolution/actions/resolveScoped.js';
import { resolveScopedWithNoActivations } from '../../resolution/actions/resolveScopedWithNoActivations.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import {
  type Resolved,
  type SyncResolved,
} from '../../resolution/models/Resolved.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';

const ZERO_CONSTRUCTOR_ARGUMENTS: number = 0;
const ONE_CONSTRUCTOR_ARGUMENT: number = 1;
const TWO_CONSTRUCTOR_ARGUMENTS: number = 2;
const THREE_CONSTRUCTOR_ARGUMENTS: number = 3;
const FOUR_CONSTRUCTOR_ARGUMENTS: number = 4;

const resolveInstanceBindingNode: <
  TActivated,
  TBinding extends InstanceBinding<TActivated> = InstanceBinding<TActivated>,
>(
  params: ResolutionParams,
  node: InstanceBindingNode<TActivated, TBinding>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Resolved<TActivated> = curryResolveInstanceBindingNode<any, any>(
  resolveInstanceBindingConstructorParams,
  resolveInstanceBindingNodeAsyncFromConstructorParams,
  resolveInstanceBindingNodeFromConstructorParams,
);

const resolveScopedInstanceBindingNode: <TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
) => (params: ResolutionParams) => Resolved<TActivated> = <TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
) =>
  resolveScoped<
    TActivated,
    typeof bindingTypeValues.Instance,
    InstanceBinding<TActivated>,
    InstanceBindingNode<TActivated, InstanceBinding<TActivated>>
  >(node, resolveInstanceBindingNode);

/**
 * Builds a resolver for instance binding nodes with no properties to set,
 * no post construct methods and no binding activation.
 *
 * The resolution logic is inlined in a single closure to minimize function
 * call dispatch overhead: this is the hottest resolution path. Common small
 * constructor arities are specialized to avoid constructor values array
 * allocations and spread construct calls.
 */
function buildSimpleInstanceBindingNodeResolver<TActivated>(
  binding: InstanceBinding<TActivated>,
  classMetadata: ClassMetadata,
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
): (params: ResolutionParams) => Resolved<TActivated> {
  const implementationType: Newable<TActivated> = binding.implementationType;
  const serviceIdentifier: ServiceIdentifier<TActivated> =
    binding.serviceIdentifier;

  function resolveInstanceActivations(
    params: ResolutionParams,
    instance: SyncResolved<TActivated>,
  ): Resolved<TActivated> {
    if (params.getActivations(serviceIdentifier) === undefined) {
      return instance;
    }

    return resolveBindingServiceActivations<TActivated>(
      params,
      serviceIdentifier,
      instance,
    );
  }

  let resolveNode: (params: ResolutionParams) => Resolved<TActivated>;

  switch (classMetadata.constructorArguments.length) {
    case ZERO_CONSTRUCTOR_ARGUMENTS:
      resolveNode = (params: ResolutionParams): Resolved<TActivated> =>
        resolveInstanceActivations(params, new implementationType());
      break;
    case ONE_CONSTRUCTOR_ARGUMENT:
      resolveNode = (params: ResolutionParams): Resolved<TActivated> => {
        const resolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.constructorParams[0]!.resolve(params);

        if (isPromise(resolvedValue)) {
          return resolveInstanceBindingNodeAsyncFromOnlyConstructorParams(
            Promise.all([resolvedValue]),
            params,
            node,
          );
        }

        return resolveInstanceActivations(
          params,
          new implementationType(resolvedValue),
        );
      };
      break;
    case TWO_CONSTRUCTOR_ARGUMENTS:
      resolveNode = (params: ResolutionParams): Resolved<TActivated> => {
        const firstResolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.constructorParams[0]!.resolve(params);
        const secondResolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.constructorParams[1]!.resolve(params);

        if (isPromise(firstResolvedValue) || isPromise(secondResolvedValue)) {
          return resolveInstanceBindingNodeAsyncFromOnlyConstructorParams(
            Promise.all([firstResolvedValue, secondResolvedValue]),
            params,
            node,
          );
        }

        return resolveInstanceActivations(
          params,
          new implementationType(firstResolvedValue, secondResolvedValue),
        );
      };
      break;
    case THREE_CONSTRUCTOR_ARGUMENTS:
      resolveNode = (params: ResolutionParams): Resolved<TActivated> => {
        const firstResolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.constructorParams[0]!.resolve(params);
        const secondResolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.constructorParams[1]!.resolve(params);
        const thirdResolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.constructorParams[2]!.resolve(params);

        if (
          isPromise(firstResolvedValue) ||
          isPromise(secondResolvedValue) ||
          isPromise(thirdResolvedValue)
        ) {
          return resolveInstanceBindingNodeAsyncFromOnlyConstructorParams(
            Promise.all([
              firstResolvedValue,
              secondResolvedValue,
              thirdResolvedValue,
            ]),
            params,
            node,
          );
        }

        return resolveInstanceActivations(
          params,
          new implementationType(
            firstResolvedValue,
            secondResolvedValue,
            thirdResolvedValue,
          ),
        );
      };
      break;
    case FOUR_CONSTRUCTOR_ARGUMENTS:
      resolveNode = (params: ResolutionParams): Resolved<TActivated> => {
        const firstResolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.constructorParams[0]!.resolve(params);
        const secondResolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.constructorParams[1]!.resolve(params);
        const thirdResolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.constructorParams[2]!.resolve(params);
        const fourthResolvedValue: unknown =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          node.constructorParams[3]!.resolve(params);

        if (
          isPromise(firstResolvedValue) ||
          isPromise(secondResolvedValue) ||
          isPromise(thirdResolvedValue) ||
          isPromise(fourthResolvedValue)
        ) {
          return resolveInstanceBindingNodeAsyncFromOnlyConstructorParams(
            Promise.all([
              firstResolvedValue,
              secondResolvedValue,
              thirdResolvedValue,
              fourthResolvedValue,
            ]),
            params,
            node,
          );
        }

        return resolveInstanceActivations(
          params,
          new implementationType(
            firstResolvedValue,
            secondResolvedValue,
            thirdResolvedValue,
            fourthResolvedValue,
          ),
        );
      };
      break;
    default:
      resolveNode = (params: ResolutionParams): Resolved<TActivated> => {
        const constructorValues: unknown[] | Promise<unknown[]> =
          resolveInstanceBindingConstructorParams(params, node);

        if (isPromise(constructorValues)) {
          return resolveInstanceBindingNodeAsyncFromOnlyConstructorParams(
            constructorValues,
            params,
            node,
          );
        }

        return resolveInstanceActivations(
          params,
          new implementationType(...constructorValues),
        );
      };
  }

  return resolveScopedWithNoActivations(binding, resolveNode);
}

export function buildInstanceBindingNodeResolver<TActivated>(
  binding: InstanceBinding<TActivated>,
  classMetadata: ClassMetadata,
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
): (params: ResolutionParams) => Resolved<TActivated> {
  if (
    classMetadata.lifecycle.postConstructMethodNames.size === 0 &&
    binding.onActivation === undefined &&
    classMetadata.properties.size === 0
  ) {
    return buildSimpleInstanceBindingNodeResolver(binding, classMetadata, node);
  }

  return resolveScopedInstanceBindingNode(node);
}
