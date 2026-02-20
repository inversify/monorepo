import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import { type SingleImmutableLinkedListNode } from '../../common/models/SingleImmutableLinkedList.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { checkPlanServiceRedirectionBindingNodeSingleInjectionBindings } from './checkPlanServiceRedirectionBindingNodeSingleInjectionBindings.js';
import { isPlanServiceRedirectionBindingNode } from './isPlanServiceRedirectionBindingNode.js';
import { throwErrorWhenUnexpectedBindingsAmountFound } from './throwErrorWhenUnexpectedBindingsAmountFound.js';

const SINGLE_INJECTION_BINDINGS: number = 1;

export function checkServiceNodeSingleInjectionBindings(
  serviceNode: PlanServiceNode,
  isOptional: boolean,
  bindingConstraintNode: SingleImmutableLinkedListNode<InternalBindingConstraints>,
): void {
  if (Array.isArray(serviceNode.bindings)) {
    if (serviceNode.bindings.length === SINGLE_INJECTION_BINDINGS) {
      const [planBindingNode]: [PlanBindingNode] = serviceNode.bindings as [
        PlanBindingNode,
      ];

      if (isPlanServiceRedirectionBindingNode(planBindingNode)) {
        checkPlanServiceRedirectionBindingNodeSingleInjectionBindings(
          planBindingNode,
          isOptional,
          bindingConstraintNode,
          [planBindingNode.binding.targetServiceIdentifier],
        );
      }

      return;
    }
  }

  throwErrorWhenUnexpectedBindingsAmountFound(
    serviceNode.bindings,
    isOptional,
    bindingConstraintNode,
    [],
  );
}
