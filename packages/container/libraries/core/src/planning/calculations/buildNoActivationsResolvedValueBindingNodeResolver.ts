import { type ServiceIdentifier } from '@inversifyjs/common';

import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { resolveResolvedValueBindingNode } from '../../resolution/actions/resolveResolvedValueBindingNode.js';
import { resolveScopedWithNoActivations } from '../../resolution/actions/resolveScopedWithNoActivations.js';
import { resolveServiceActivations } from '../../resolution/actions/resolveServiceActivations.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { buildFourResolvedValueArgumentResolver } from './buildFourResolvedValueArgumentResolver.js';
import { buildOneResolvedValueArgumentResolver } from './buildOneResolvedValueArgumentResolver.js';
import { buildThreeResolvedValueArgumentResolver } from './buildThreeResolvedValueArgumentResolver.js';
import { buildTwoResolvedValueArgumentResolver } from './buildTwoResolvedValueArgumentResolver.js';
import { buildZeroResolvedValueArgumentsResolver } from './buildZeroResolvedValueArgumentsResolver.js';

const ZERO_PARAMS: number = 0;
const ONE_PARAM: number = 1;
const TWO_PARAMS: number = 2;
const THREE_PARAMS: number = 3;
const FOUR_PARAMS: number = 4;

/**
 * Builds a resolver for resolved value binding nodes with no binding
 * activation.
 *
 * Unlike the JIT path, specialized CSP resolvers are implemented with plain
 * closures instead of the `Function` constructor, so they work in
 * environments enforcing a strict Content Security Policy (no
 * `unsafe-eval`).
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
      resolveNode = buildTwoResolvedValueArgumentResolver(
        node,
        resolveActivations,
      );
      break;
    case THREE_PARAMS:
      resolveNode = buildThreeResolvedValueArgumentResolver(
        node,
        resolveActivations,
      );
      break;
    case FOUR_PARAMS:
      resolveNode = buildFourResolvedValueArgumentResolver(
        node,
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
