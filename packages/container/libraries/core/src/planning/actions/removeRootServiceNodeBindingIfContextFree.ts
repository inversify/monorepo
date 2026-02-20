import { type Binding } from '../../binding/models/Binding.js';
import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import { type SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { type PlanServiceNodeBindingRemovedResult } from '../../metadata/models/PlanServiceNodeBindingRemovedResult.js';
import { buildPlanBindingConstraintsList } from '../calculations/buildPlanBindingConstraintsList.js';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode.js';
import { type PlanParams } from '../models/PlanParams.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { removeServiceNodeBindingIfContextFree } from './removeServiceNodeBindingIfContextFree.js';

/**
 * Detach a binding to the root service node if it is context-free.
 * @param params The plan parameters.
 * @param serviceNode The service node to attach the binding to.
 * @param binding The binding to attach.
 * @returns True if the binding requires ancestor metadata, false otherwise.
 */
export function removeRootServiceNodeBindingIfContextFree(
  params: PlanParams,
  serviceNode: PlanServiceNode,
  binding: Binding<unknown>,
): PlanServiceNodeBindingRemovedResult {
  if (LazyPlanServiceNode.is(serviceNode) && !serviceNode.isExpanded()) {
    return {
      bindingNodeRemoved: undefined,
      isContextFreeBinding: true,
    };
  }

  const bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints> =
    buildPlanBindingConstraintsList(params);

  return removeServiceNodeBindingIfContextFree(
    serviceNode,
    binding,
    bindingConstraintsList,
    params.rootConstraints.isOptional ?? false,
  );
}
