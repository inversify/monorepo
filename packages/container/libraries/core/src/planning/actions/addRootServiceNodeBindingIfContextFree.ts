import { Binding } from '../../binding/models/Binding';
import { InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList';
import { PlanServiceNodeBindingAddedResult } from '../../metadata/models/PlanServiceNodeBindingAddedResult';
import { buildPlanBindingConstraintsList } from '../calculations/buildPlanBindingConstraintsList';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode';
import { PlanParams } from '../models/PlanParams';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { addServiceNodeBindingIfContextFree } from './addServiceNodeBindingIfContextFree';

/**
 * Attach a binding to the root service node if the binding is context-free.
 * @param params The plan parameters.
 * @param serviceNode The service node to attach the binding to.
 * @param binding The binding to attach.
 * @returns True if the binding requires ancestor metadata, false otherwise.
 */
export function addRootServiceNodeBindingIfContextFree(
  params: PlanParams,
  serviceNode: PlanServiceNode,
  binding: Binding<unknown>,
): PlanServiceNodeBindingAddedResult {
  if (LazyPlanServiceNode.is(serviceNode) && !serviceNode.isExpanded()) {
    return {
      isContextFreeBinding: true,
      shouldInvalidateServiceNode: false,
    };
  }

  const bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints> =
    buildPlanBindingConstraintsList(params);

  const chained: boolean =
    params.rootConstraints.isMultiple && params.rootConstraints.chained;

  return addServiceNodeBindingIfContextFree(
    params,
    serviceNode,
    binding,
    bindingConstraintsList,
    chained,
  );
}
