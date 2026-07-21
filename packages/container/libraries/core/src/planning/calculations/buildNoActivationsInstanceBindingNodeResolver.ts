import { type ServiceIdentifier } from '@inversifyjs/common';

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { resolveScopedWithNoActivations } from '../../resolution/actions/resolveScopedWithNoActivations.js';
import { resolveServiceActivations } from '../../resolution/actions/resolveServiceActivations.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { buildConstructorArgumentsResolver } from './buildConstructorArgumentsResolver.js';
import { buildFourConstructorArgumentResolver } from './buildFourConstructorArgumentResolver.js';
import { buildOneConstructorArgumentResolver } from './buildOneConstructorArgumentResolver.js';
import { buildThreeConstructorArgumentResolver } from './buildThreeConstructorArgumentResolver.js';
import { buildTwoConstructorArgumentResolver } from './buildTwoConstructorArgumentResolver.js';
import { buildZeroConstructorArgumentsResolver } from './buildZeroConstructorArgumentsResolver.js';
import { resolveMany } from './resolveMany.js';

const ZERO_CONSTRUCTOR_ARGUMENTS: number = 0;
const ONE_CONSTRUCTOR_ARGUMENT: number = 1;
const TWO_CONSTRUCTOR_ARGUMENTS: number = 2;
const THREE_CONSTRUCTOR_ARGUMENTS: number = 3;
const FOUR_CONSTRUCTOR_ARGUMENTS: number = 4;

/**
 * Builds a resolver for instance binding nodes with
 * no post construct methods and no binding activation.
 *
 * Unlike the JIT path, specialized CSP resolvers key only on constructor
 * arity: property injection is handled inside those resolvers via
 * `setInstanceProperties`, so mixed ctor/property graphs must not be
 * dispatched as if properties were extra constructor arguments.
 */
export function buildNoActivationsInstanceBindingNodeResolver<TActivated>(
  node: InstanceBindingNode<TActivated, InstanceBinding<TActivated>>,
  areServiceActivations: boolean,
): (params: ResolutionParams) => Resolved<TActivated> {
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

  switch (node.classMetadata.constructorArguments.length) {
    case ZERO_CONSTRUCTOR_ARGUMENTS:
      resolveNode = buildZeroConstructorArgumentsResolver(
        node,
        resolveActivations,
      );
      break;
    case ONE_CONSTRUCTOR_ARGUMENT:
      resolveNode = buildOneConstructorArgumentResolver(
        node,
        resolveActivations,
      );
      break;
    case TWO_CONSTRUCTOR_ARGUMENTS:
      resolveNode = buildTwoConstructorArgumentResolver(
        node,
        resolveActivations,
      );
      break;
    case THREE_CONSTRUCTOR_ARGUMENTS:
      resolveNode = buildThreeConstructorArgumentResolver(
        node,
        resolveActivations,
      );
      break;
    case FOUR_CONSTRUCTOR_ARGUMENTS:
      resolveNode = buildFourConstructorArgumentResolver(
        node,
        resolveActivations,
      );
      break;
    default:
      resolveNode = buildConstructorArgumentsResolver(
        node,
        resolveMany,
        resolveActivations,
      );
  }

  return resolveScopedWithNoActivations(node.binding, resolveNode);
}
