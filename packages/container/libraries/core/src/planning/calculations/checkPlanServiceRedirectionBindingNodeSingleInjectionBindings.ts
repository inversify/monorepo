import { ServiceIdentifier } from '@inversifyjs/common';

import { InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation';
import { SingleImmutableLinkedListNode } from '../../common/models/SingleImmutableLinkedList';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanServiceRedirectionBindingNode } from '../models/PlanServiceRedirectionBindingNode';
import { isPlanServiceRedirectionBindingNode } from './isPlanServiceRedirectionBindingNode';
import { throwErrorWhenUnexpectedBindingsAmountFound } from './throwErrorWhenUnexpectedBindingsAmountFound';

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
