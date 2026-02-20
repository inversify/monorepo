import { type ServiceIdentifier } from '@inversifyjs/common';

import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import { type SingleImmutableLinkedListNode } from '../../common/models/SingleImmutableLinkedList.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanServiceRedirectionBindingNode } from '../models/PlanServiceRedirectionBindingNode.js';
import { isPlanServiceRedirectionBindingNode } from './isPlanServiceRedirectionBindingNode.js';
import { throwErrorWhenUnexpectedBindingsAmountFound } from './throwErrorWhenUnexpectedBindingsAmountFound.js';

const SINGLE_INJECTION_BINDINGS: number = 1;

export function checkPlanServiceRedirectionBindingNodeSingleInjectionBindings(
  serviceRedirectionBindingNode: PlanServiceRedirectionBindingNode,
  isOptional: boolean,
  bindingConstraintNode: SingleImmutableLinkedListNode<InternalBindingConstraints>,
  serviceRedirections: readonly ServiceIdentifier[],
): void {
  if (
    serviceRedirectionBindingNode.redirections.length ===
    SINGLE_INJECTION_BINDINGS
  ) {
    const [planBindingNode]: [PlanBindingNode] =
      serviceRedirectionBindingNode.redirections as [PlanBindingNode];

    if (isPlanServiceRedirectionBindingNode(planBindingNode)) {
      checkPlanServiceRedirectionBindingNodeSingleInjectionBindings(
        planBindingNode,
        isOptional,
        bindingConstraintNode,
        [
          ...serviceRedirections,
          planBindingNode.binding.targetServiceIdentifier,
        ],
      );
    }

    return;
  }

  throwErrorWhenUnexpectedBindingsAmountFound(
    serviceRedirectionBindingNode.redirections,
    isOptional,
    bindingConstraintNode,
    serviceRedirections,
  );
}
