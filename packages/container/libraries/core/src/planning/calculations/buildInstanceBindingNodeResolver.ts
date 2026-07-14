import {
  isPromise,
  type Newable,
  type ServiceIdentifier,
} from '@inversifyjs/common';

import { type BindingActivation } from '../../binding/models/BindingActivation.js';
import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { resolveBindingActivationsFromIterator } from '../../resolution/actions/resolveBindingActivationsFromIterator.js';
import { resolveBindingActivationsFromIteratorAsync } from '../../resolution/actions/resolveBindingActivationsFromIteratorAsync.js';
import { resolveInstanceBindingConstructorParams } from '../../resolution/actions/resolveInstanceBindingConstructorParams.js';
import { resolveInstanceBindingNode as curryResolveInstanceBindingNode } from '../../resolution/actions/resolveInstanceBindingNode.js';
import { resolveInstanceBindingNodeAsyncFromConstructorParams } from '../../resolution/actions/resolveInstanceBindingNodeAsyncFromConstructorParams.js';
import { resolveInstanceBindingNodeFromConstructorParams } from '../../resolution/actions/resolveInstanceBindingNodeFromConstructorParams.js';
import { resolveScoped } from '../../resolution/actions/resolveScoped.js';
import { resolveScopedWithNoActivations } from '../../resolution/actions/resolveScopedWithNoActivations.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { buildConstructorArgumentsResolver } from './buildConstructorArgumentsResolver.js';
import { buildOneConstructorArgumentResolver } from './buildOneConstructorArgumentResolver.js';
import { buildOnePropertyArgumentResolver } from './buildOnePropertyArgumentResolver.js';
import { buildResolveMany } from './buildResolveMany.js';
import { buildZeroConstructorArgumentsResolver } from './buildZeroConstructorArgumentsResolver.js';
import { resolveFour } from './resolveFour.js';
import { resolveThree } from './resolveThree.js';
import { resolveTwo } from './resolveTwo.js';

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
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
): (params: ResolutionParams) => Resolved<TActivated> {
  const implementationType: Newable<TActivated> =
    node.binding.implementationType;
  const serviceIdentifier: ServiceIdentifier<TActivated> =
    node.binding.serviceIdentifier;

  function resolveActivations(
    params: ResolutionParams,
    instance: Resolved<TActivated>,
  ): Resolved<TActivated> {
    const activations: Iterable<BindingActivation<TActivated>> | undefined =
      params.getActivations(serviceIdentifier);

    if (activations === undefined) {
      return instance;
    }

    if (isPromise(instance)) {
      return resolveBindingActivationsFromIteratorAsync(
        params,
        instance,
        activations[Symbol.iterator](),
      );
    }

    return resolveBindingActivationsFromIterator(
      params,
      instance,
      activations[Symbol.iterator](),
    );
  }

  let resolveNode: (params: ResolutionParams) => Resolved<TActivated>;

  switch (
    node.classMetadata.constructorArguments.length +
    node.classMetadata.properties.size
  ) {
    case ZERO_CONSTRUCTOR_ARGUMENTS:
      resolveNode = buildZeroConstructorArgumentsResolver(
        implementationType,
        resolveActivations,
      );
      break;
    case ONE_CONSTRUCTOR_ARGUMENT:
      resolveNode =
        node.classMetadata.properties.size === 0
          ? buildOneConstructorArgumentResolver(
              node,
              implementationType,
              resolveActivations,
            )
          : buildOnePropertyArgumentResolver(
              node,
              implementationType,
              resolveActivations,
            );
      break;
    case TWO_CONSTRUCTOR_ARGUMENTS:
      resolveNode = buildConstructorArgumentsResolver(
        node,
        implementationType,
        resolveTwo,
        resolveActivations,
      );
      break;
    case THREE_CONSTRUCTOR_ARGUMENTS:
      resolveNode = buildConstructorArgumentsResolver(
        node,
        implementationType,
        resolveThree,
        resolveActivations,
      );
      break;
    case FOUR_CONSTRUCTOR_ARGUMENTS:
      resolveNode = buildConstructorArgumentsResolver(
        node,
        implementationType,
        resolveFour,
        resolveActivations,
      );
      break;
    default:
      resolveNode = buildConstructorArgumentsResolver(
        node,
        implementationType,
        buildResolveMany(node),
        resolveActivations,
      );
  }

  return resolveScopedWithNoActivations(node.binding, resolveNode);
}

export function buildInstanceBindingNodeResolver<TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
): (params: ResolutionParams) => Resolved<TActivated> {
  if (
    node.classMetadata.lifecycle.postConstructMethodNames.size === 0 &&
    node.binding.onActivation === undefined
  ) {
    return buildSimpleInstanceBindingNodeResolver(node);
  }

  return resolveScopedInstanceBindingNode(node);
}
