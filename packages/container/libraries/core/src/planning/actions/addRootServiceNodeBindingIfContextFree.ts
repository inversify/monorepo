import { type Binding } from '../../binding/models/Binding.js';
import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import { type SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { type PlanServiceNodeBindingAddedResult } from '../../metadata/models/PlanServiceNodeBindingAddedResult.js';
import { buildPlanBindingConstraintsList } from '../calculations/buildPlanBindingConstraintsList.js';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode.js';
import { type PlanParams } from '../models/PlanParams.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { addServiceNodeBindingIfContextFree } from './addServiceNodeBindingIfContextFree.js';

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
