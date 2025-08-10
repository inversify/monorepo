import { Binding } from '../../binding/models/Binding';
import { BindingConstraints } from '../../binding/models/BindingConstraints';
import {
  BindingConstraintsImplementation,
  InternalBindingConstraints,
} from '../../binding/models/BindingConstraintsImplementation';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { PlanServiceNodeBindingRemovedResult } from '../../metadata/models/PlanServiceNodeBindingRemovedResult';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanServiceNode } from '../models/PlanServiceNode';

/**
 * Detach a binding to the root service node if it is context-free.
 * @param serviceNode The service node to attach the binding to.
 * @param binding The binding to attach.
 * @param bindingConstraintsList The list of binding constraints.
 * @param optionalBindings Whether the bindings are optional.
 * @returns True if the binding requires ancestor metadata, false otherwise.
 */
export function removeServiceNodeBindingIfContextFree(
  serviceNode: PlanServiceNode,
  binding: Binding<unknown>,
  bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  optionalBindings: boolean,
): PlanServiceNodeBindingRemovedResult {
  if (LazyPlanServiceNode.is(serviceNode) && !serviceNode.isExpanded()) {
    return {
      bindingNodeRemoved: undefined,
      isContextFreeBinding: true,
    };
  }

  const bindingConstraints: BindingConstraints =
    new BindingConstraintsImplementation(bindingConstraintsList.last);

  if (
    !binding.isSatisfiedBy(bindingConstraints) ||
    bindingConstraintsList.last.elem.getAncestorsCalled
  ) {
    return {
      bindingNodeRemoved: undefined,
      isContextFreeBinding:
        !bindingConstraintsList.last.elem.getAncestorsCalled,
    };
  }

  let bindingNodeRemoved: PlanBindingNode | undefined;

  if (Array.isArray(serviceNode.bindings)) {
    serviceNode.bindings = serviceNode.bindings.filter(
      (bindingNode: PlanBindingNode): boolean => {
        if (bindingNode.binding === binding) {
          bindingNodeRemoved = bindingNode;
          return false;
        }
        return true;
      },
    );
  } else {
    if (serviceNode.bindings?.binding === binding) {
      bindingNodeRemoved = serviceNode.bindings;

      if (optionalBindings) {
        serviceNode.bindings = undefined;
      } else {
        if (!LazyPlanServiceNode.is(serviceNode)) {
          throw new InversifyCoreError(
            InversifyCoreErrorKind.planning,
            'Unexpected non-lazy plan service node. This is likely a bug in the planning logic. Please, report this issue',
          );
        }

        serviceNode.invalidate();
      }
    }
  }

  return {
    bindingNodeRemoved: bindingNodeRemoved,
    isContextFreeBinding: true,
  };
}
