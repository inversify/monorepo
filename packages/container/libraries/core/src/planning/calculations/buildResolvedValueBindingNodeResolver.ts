import { type ServiceIdentifier } from '@inversifyjs/common';

import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { resolveResolvedValueBindingNode } from '../../resolution/actions/resolveResolvedValueBindingNode.js';
import { resolveScoped } from '../../resolution/actions/resolveScoped.js';
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

  const resolveActivations: (
    params: ResolutionParams,
    value: Resolved<TActivated>,
  ) => Resolved<TActivated> = resolveServiceActivations(serviceIdentifier);

  let resolveNode: (params: ResolutionParams) => Resolved<TActivated>;

  switch (node.binding.metadata.arguments.length) {
    case ZERO_PARAMS:
      resolveNode = buildZeroResolvedValueArgumentsResolver(
        factory,
        resolveActivations,
      );
      break;
    case ONE_PARAM:
      resolveNode = buildOneResolvedValueArgumentResolver(
        node,
        factory,
        resolveActivations,
      );
      break;
    case TWO_PARAMS:
      resolveNode = buildResolvedValueArgumentsResolver(
        node,
        factory,
        resolveActivations,
        resolveTwo,
      );
      break;
    case THREE_PARAMS:
      resolveNode = buildResolvedValueArgumentsResolver(
        node,
        factory,
        resolveActivations,
        resolveThree,
      );
      break;
    case FOUR_PARAMS:
      resolveNode = buildResolvedValueArgumentsResolver(
        node,
        factory,
        resolveActivations,
        resolveFour,
      );
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
