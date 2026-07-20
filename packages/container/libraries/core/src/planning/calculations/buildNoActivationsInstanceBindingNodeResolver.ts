import { type Newable, type ServiceIdentifier } from '@inversifyjs/common';

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { resolveScopedWithNoActivations } from '../../resolution/actions/resolveScopedWithNoActivations.js';
import { resolveServiceActivations } from '../../resolution/actions/resolveServiceActivations.js';
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

/**
 * Builds a resolver for instance binding nodes with
 * no post construct methods and no binding activation.
 *
 * The resolution logic is inlined in a single closure to minimize function
 * call dispatch overhead: this is the hottest resolution path. Common small
 * constructor arities are specialized to avoid constructor values array
 * allocations and spread construct calls.
 */
export function buildNoActivationsInstanceBindingNodeResolver<TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
  areServiceActivations: boolean,
): (params: ResolutionParams) => Resolved<TActivated> {
  const implementationType: Newable<TActivated> =
    node.binding.implementationType;
  const serviceIdentifier: ServiceIdentifier<TActivated> =
    node.binding.serviceIdentifier;

  const resolveActivations:
    | ((
        params: ResolutionParams,
        value: Resolved<TActivated>,
      ) => Resolved<TActivated>)
    | undefined = areServiceActivations
    ? resolveServiceActivations(serviceIdentifier)
    : undefined;

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
