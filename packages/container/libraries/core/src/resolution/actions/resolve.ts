import { isPromise } from '@inversifyjs/common';

import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { handleResolveError } from '../../planning/calculations/handleResolveError.js';
import { isPlanServiceRedirectionBindingNode } from '../../planning/calculations/isPlanServiceRedirectionBindingNode.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { type LeafBindingNode } from '../../planning/models/LeafBindingNode.js';
import { type PlanBindingNode } from '../../planning/models/PlanBindingNode.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type PlanServiceNodeParent } from '../../planning/models/PlanServiceNodeParent.js';
import { type PlanServiceRedirectionBindingNode } from '../../planning/models/PlanServiceRedirectionBindingNode.js';
import { type ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved } from '../models/Resolved.js';
import { resolveConstantValueBinding } from './resolveConstantValueBinding.js';
import { resolveDynamicValueBinding } from './resolveDynamicValueBinding.js';
import { resolveFactoryBinding } from './resolveFactoryBinding.js';
import { resolveInstanceBindingConstructorParams as curryResolveInstanceBindingConstructorParams } from './resolveInstanceBindingConstructorParams.js';
import { resolveInstanceBindingNode as curryResolveInstanceBindingNode } from './resolveInstanceBindingNode.js';
import { resolveInstanceBindingNodeAsyncFromConstructorParams } from './resolveInstanceBindingNodeAsyncFromConstructorParams.js';
import { resolveInstanceBindingNodeFromConstructorParams } from './resolveInstanceBindingNodeFromConstructorParams.js';
import { resolveResolvedValueBindingNode as curryResolveResolvedValueBindingNode } from './resolveResolvedValueBindingNode.js';
import { resolveResolvedValueBindingParams as curryResolveResolvedValueBindingParams } from './resolveResolvedValueBindingParams.js';
import { resolveScopedInstanceBindingNode as curryResolveScopedInstanceBindingNode } from './resolveScopedInstanceBindingNode.js';
import { resolveScopedResolvedValueBindingNode as curryResolveScopedResolvedValueBindingNode } from './resolveScopedResolvedValueBindingNode.js';
import { resolveServiceRedirectionBindingNode as curryResolveServiceRedirectionBindingNode } from './resolveServiceRedirectionBindingNode.js';
import { setInstanceProperties as currySetInstanceProperties } from './setInstanceProperties.js';

const setInstanceProperties: (
  params: ResolutionParams,
  instance: Record<string | symbol, unknown>,
  node: InstanceBindingNode,
) => void | Promise<void> = currySetInstanceProperties(resolveServiceNode);

const resolveServiceRedirectionBindingNode: (
  params: ResolutionParams,
  node: PlanServiceRedirectionBindingNode,
) => unknown[] = curryResolveServiceRedirectionBindingNode(resolveBindingNode);

const resolveInstanceBindingNode: <
  TActivated,
  TBinding extends InstanceBinding<TActivated> = InstanceBinding<TActivated>,
>(
  params: ResolutionParams,
  node: InstanceBindingNode<TBinding>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Resolved<TActivated> = curryResolveInstanceBindingNode<any>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  curryResolveInstanceBindingConstructorParams<any>(resolveServiceNode),
  resolveInstanceBindingNodeAsyncFromConstructorParams(
    resolveInstanceBindingNodeFromConstructorParams(setInstanceProperties),
  ),
  resolveInstanceBindingNodeFromConstructorParams(setInstanceProperties),
);

const resolveResolvedValueBindingNode: <
  TActivated,
  TBinding extends ResolvedValueBinding<TActivated> =
    ResolvedValueBinding<TActivated>,
>(
  params: ResolutionParams,
  node: ResolvedValueBindingNode<TBinding>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => Resolved<TActivated> = curryResolveResolvedValueBindingNode<any>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  curryResolveResolvedValueBindingParams<any>(resolveServiceNode),
);

const resolveScopedInstanceBindingNode: <TActivated>(
  params: ResolutionParams,
  node: InstanceBindingNode<InstanceBinding<TActivated>>,
) => Resolved<TActivated> = curryResolveScopedInstanceBindingNode(
  resolveInstanceBindingNode,
);

const resolveScopedResolvedValueBindingNode: <TActivated>(
  params: ResolutionParams,
  node: ResolvedValueBindingNode<ResolvedValueBinding<TActivated>>,
) => Resolved<TActivated> = curryResolveScopedResolvedValueBindingNode(
  resolveResolvedValueBindingNode,
);

export function resolve(params: ResolutionParams): unknown {
  try {
    const serviceNode: PlanServiceNode = params.planResult.tree.root;

    return resolveServiceNode(params, serviceNode);
  } catch (error: unknown) {
    handleResolveError(params, error);
  }
}

function resolveBindingNode<TActivated>(
  params: ResolutionParams,
  planBindingNode: PlanServiceNodeParent | LeafBindingNode<TActivated>,
): Resolved<TActivated> {
  switch (planBindingNode.binding.type) {
    case bindingTypeValues.ConstantValue:
      return resolveConstantValueBinding(params, planBindingNode.binding);
    case bindingTypeValues.DynamicValue:
      return resolveDynamicValueBinding(params, planBindingNode.binding);
    case bindingTypeValues.Factory:
      return resolveFactoryBinding(params, planBindingNode.binding);
    case bindingTypeValues.Instance:
      return resolveScopedInstanceBindingNode<TActivated>(
        params,
        planBindingNode as InstanceBindingNode<InstanceBinding<TActivated>>,
      );
    case bindingTypeValues.ResolvedValue:
      return resolveScopedResolvedValueBindingNode<TActivated>(
        params,
        planBindingNode as ResolvedValueBindingNode<
          ResolvedValueBinding<TActivated>
        >,
      );
  }
}

function resolveServiceNode(
  params: ResolutionParams,
  serviceNode: PlanServiceNode,
): unknown {
  if (serviceNode.bindings === undefined) {
    return undefined;
  }

  if (Array.isArray(serviceNode.bindings)) {
    return resolveMultipleBindingServiceNode(params, serviceNode.bindings);
  }

  return resolveSingleBindingServiceNode(params, serviceNode.bindings);
}

function resolveMultipleBindingServiceNode(
  params: ResolutionParams,
  bindings: PlanBindingNode[],
): unknown[] | Promise<unknown[]> {
  const resolvedValues: unknown[] = [];

  for (const binding of bindings) {
    if (isPlanServiceRedirectionBindingNode(binding)) {
      resolvedValues.push(
        ...resolveServiceRedirectionBindingNode(params, binding),
      );
    } else {
      resolvedValues.push(resolveBindingNode(params, binding));
    }
  }

  if (resolvedValues.some(isPromise)) {
    return Promise.all(resolvedValues);
  }

  return resolvedValues;
}

function resolveSingleBindingServiceNode(
  params: ResolutionParams,
  binding: PlanBindingNode,
): unknown {
  if (isPlanServiceRedirectionBindingNode(binding)) {
    const resolvedValues: unknown[] = resolveServiceRedirectionBindingNode(
      params,
      binding,
    );

    if (resolvedValues.length === 1) {
      return resolvedValues[0];
    } else {
      throw new InversifyCoreError(
        InversifyCoreErrorKind.resolution,
        'Unexpected multiple resolved values on single injection',
      );
    }
  } else {
    return resolveBindingNode(params, binding);
  }
}
