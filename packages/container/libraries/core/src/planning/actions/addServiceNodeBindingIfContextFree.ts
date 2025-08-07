import { Binding } from '../../binding/models/Binding';
import { BindingConstraints } from '../../binding/models/BindingConstraints';
import {
  BindingConstraintsImplementation,
  InternalBindingConstraints,
} from '../../binding/models/BindingConstraintsImplementation';
import { SingleInmutableLinkedList } from '../../common/models/SingleInmutableLinkedList';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { ManagedClassElementMetadata } from '../../metadata/models/ManagedClassElementMetadata';
import { PlanServiceNodeBindingAddedResult } from '../../metadata/models/PlanServiceNodeBindingAddedResult';
import { ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata';
import { BasePlanParams } from '../models/BasePlanParams';
import { BindingNodeParent } from '../models/BindingNodeParent';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { SubplanParams } from '../models/SubplanParams';
import { curryBuildServiceNodeBindings } from './curryBuildServiceNodeBindings';
import { curryLazyBuildPlanServiceNodeFromClassElementMetadata } from './curryLazyBuildPlanServiceNodeFromClassElementMetadata';
import { curryLazyBuildPlanServiceNodeFromResolvedValueElementMetadata } from './curryLazyBuildPlanServiceNodeFromResolvedValueElementMetadata';
import { currySubplan } from './currySubplan';
import {
  buildPlanServiceNodeFromClassElementMetadata,
  buildPlanServiceNodeFromResolvedValueElementMetadata,
} from './plan';

const subplan: (
  params: SubplanParams,
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
) => PlanBindingNode = currySubplan(
  buildPlanServiceNodeFromClassElementMetadata,
  buildPlanServiceNodeFromResolvedValueElementMetadata,
  circularLazyBuildPlanServiceNodeFromClassElementMetadata,
  circularLazyBuildPlanServiceNodeFromResolvedValueElementMetadata,
);

const buildServiceNodeBindings: (
  params: BasePlanParams,
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
  serviceBindings: Binding<unknown>[],
  parentNode: BindingNodeParent,
  chainedBindings: boolean,
) => PlanBindingNode[] = curryBuildServiceNodeBindings(subplan);

const lazyBuildPlanServiceNodeFromClassElementMetadata: (
  params: SubplanParams,
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
  elementMetadata: ManagedClassElementMetadata,
) => PlanServiceNode | undefined =
  curryLazyBuildPlanServiceNodeFromClassElementMetadata(
    buildServiceNodeBindings,
  );

const lazyBuildPlanServiceNodeFromResolvedValueElementMetadata: (
  params: SubplanParams,
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
  elementMetadata: ResolvedValueElementMetadata,
) => PlanServiceNode | undefined =
  curryLazyBuildPlanServiceNodeFromResolvedValueElementMetadata(
    buildServiceNodeBindings,
  );

function circularLazyBuildPlanServiceNodeFromClassElementMetadata(
  params: SubplanParams,
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
  elementMetadata: ManagedClassElementMetadata,
): PlanServiceNode | undefined {
  return lazyBuildPlanServiceNodeFromClassElementMetadata(
    params,
    bindingConstraintsList,
    elementMetadata,
  );
}

function circularLazyBuildPlanServiceNodeFromResolvedValueElementMetadata(
  params: SubplanParams,
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
  elementMetadata: ResolvedValueElementMetadata,
): PlanServiceNode | undefined {
  return lazyBuildPlanServiceNodeFromResolvedValueElementMetadata(
    params,
    bindingConstraintsList,
    elementMetadata,
  );
}

/**
 * Attach a binding to a service node if the binding is context-free.
 * @param params The plan parameters.
 * @param serviceNode The service node to attach the binding to.
 * @param binding The binding to attach.
 * @param bindingConstraintsList The list of binding constraints.
 * @param chainedBindings Whether the bindings are chained.
 * @returns True if the binding requires ancestor metadata, false otherwise.
 */
export function addServiceNodeBindingIfContextFree(
  params: BasePlanParams,
  serviceNode: PlanServiceNode,
  binding: Binding<unknown>,
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
  chainedBindings: boolean,
): PlanServiceNodeBindingAddedResult {
  if (LazyPlanServiceNode.is(serviceNode) && !serviceNode.isExpanded()) {
    return {
      isContextFreeBinding: true,
      shouldInvalidateServiceNode: false,
    };
  }

  const bindingConstraints: BindingConstraints =
    new BindingConstraintsImplementation(bindingConstraintsList.last);

  if (
    !binding.isSatisfiedBy(bindingConstraints) ||
    bindingConstraintsList.last.elem.getAncestorsCalled
  ) {
    return {
      isContextFreeBinding:
        !bindingConstraintsList.last.elem.getAncestorsCalled,
      shouldInvalidateServiceNode: false,
    };
  }

  const [serviceNodeBinding]: [PlanBindingNode] = buildServiceNodeBindings(
    params,
    bindingConstraintsList,
    [binding],
    serviceNode,
    chainedBindings,
  ) as [PlanBindingNode];

  if (Array.isArray(serviceNode.bindings)) {
    serviceNode.bindings.push(serviceNodeBinding);
  } else {
    if (serviceNode.bindings === undefined) {
      serviceNode.bindings = serviceNodeBinding;
    } else {
      if (!LazyPlanServiceNode.is(serviceNode)) {
        throw new InversifyCoreError(
          InversifyCoreErrorKind.planning,
          'Unexpected non-lazy plan service node. This is likely a bug in the planning logic. Please, report this issue',
        );
      }

      return {
        isContextFreeBinding: true,
        shouldInvalidateServiceNode: true,
      };
    }
  }

  return {
    isContextFreeBinding: true,
    shouldInvalidateServiceNode: false,
  };
}
