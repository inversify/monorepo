import { Binding } from '../../binding/models/Binding';
import { InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList';
import { PlanServiceNodeBindingRemovedResult } from '../../metadata/models/PlanServiceNodeBindingRemovedResult';
import { buildPlanBindingConstraintsList } from '../calculations/buildPlanBindingConstraintsList';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode';
import { PlanParams } from '../models/PlanParams';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { removeServiceNodeBindingIfContextFree } from './removeServiceNodeBindingIfContextFree';

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
