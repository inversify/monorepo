import { type ServiceIdentifier } from '@inversifyjs/common';

import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { resolveResolvedValueBindingNode } from '../../resolution/actions/resolveResolvedValueBindingNode.js';
import { resolveScopedWithNoActivations } from '../../resolution/actions/resolveScopedWithNoActivations.js';
import { resolveServiceActivations } from '../../resolution/actions/resolveServiceActivations.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { buildOneResolvedValueArgumentResolver } from './buildOneResolvedValueArgumentResolver.js';
import { buildResolvedValueArgumentsResolver } from './buildResolvedValueArgumentsResolver.js';
import { buildZeroResolvedValueArgumentsResolver } from './buildZeroResolvedValueArgumentsResolver.js';
import { resolveFour } from './resolveFour.js';
import { resolveThree } from './resolveThree.js';
import { resolveTwo } from './resolveTwo.js';

const ZERO_PARAMS: number = 0;
const ONE_PARAM: number = 1;
const TWO_PARAMS: number = 2;
const THREE_PARAMS: number = 3;
const FOUR_PARAMS: number = 4;

/**
 * Builds a resolver for resolved value binding nodes with no binding
 * activation.
 *
 * The resolution logic is specialized by argument arity to minimize function
 * call dispatch overhead on the hottest resolution path.
 */
export function buildNoActivationsResolvedValueBindingNodeResolver<TActivated>(
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
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

  switch (node.binding.metadata.arguments.length) {
    case ZERO_PARAMS:
      resolveNode = buildZeroResolvedValueArgumentsResolver(
        node,
        resolveActivations,
      );
      break;
    case ONE_PARAM:
      resolveNode = buildOneResolvedValueArgumentResolver(
        node,
        resolveActivations,
      );
      break;
    case TWO_PARAMS:
      resolveNode = buildResolvedValueArgumentsResolver(
        node,
        resolveTwo,
        resolveActivations,
      );
      break;
    case THREE_PARAMS:
      resolveNode = buildResolvedValueArgumentsResolver(
        node,
        resolveThree,
        resolveActivations,
      );
      break;
    case FOUR_PARAMS:
      resolveNode = buildResolvedValueArgumentsResolver(
        node,
        resolveFour,
        resolveActivations,
      );
      break;
    default:
      resolveNode =
        resolveActivations === undefined
          ? (params: ResolutionParams): Resolved<TActivated> =>
              resolveResolvedValueBindingNode(params, node)
          : (params: ResolutionParams): Resolved<TActivated> =>
              resolveActivations(
                params,
                resolveResolvedValueBindingNode(params, node),
              );
  }

  return resolveScopedWithNoActivations(node.binding, resolveNode);
}
