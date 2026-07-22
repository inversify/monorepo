import { type ServiceIdentifier } from '@inversifyjs/common';

import { type DynamicValueBinding } from '../../binding/models/DynamicValueBinding.js';
import { resolveScopedWithNoActivations } from '../../resolution/actions/resolveScopedWithNoActivations.js';
import { resolveServiceActivations } from '../../resolution/actions/resolveServiceActivations.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type LeafBindingNode } from '../models/LeafBindingNode.js';

/**
 * Builds a resolver for dynamic value binding nodes with no binding
 * activation.
 *
 * `node.binding.value(params.context)` is inlined so the resolution hot path
 * avoids an extra callback hop when activations can be skipped.
 */
export function buildNoActivationsDynamicValueBindingNodeResolver<TActivated>(
  node: LeafBindingNode<TActivated, DynamicValueBinding<TActivated>>,
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

  const resolveNode: (params: ResolutionParams) => Resolved<TActivated> =
    resolveActivations === undefined
      ? (params: ResolutionParams): Resolved<TActivated> =>
          node.binding.value(params.context)
      : (params: ResolutionParams): Resolved<TActivated> =>
          resolveActivations(params, node.binding.value(params.context));

  return resolveScopedWithNoActivations(node.binding, resolveNode);
}
