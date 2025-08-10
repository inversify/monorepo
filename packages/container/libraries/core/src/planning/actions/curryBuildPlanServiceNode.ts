import { Binding } from '../../binding/models/Binding';
import { BindingConstraints } from '../../binding/models/BindingConstraints';
import {
  BindingConstraintsImplementation,
  InternalBindingConstraints,
} from '../../binding/models/BindingConstraintsImplementation';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList';
import { buildFilteredServiceBindings } from '../calculations/buildFilteredServiceBindings';
import { buildPlanBindingConstraintsList } from '../calculations/buildPlanBindingConstraintsList';
import { checkServiceNodeSingleInjectionBindings } from '../calculations/checkServiceNodeSingleInjectionBindings';
import { BasePlanParams } from '../models/BasePlanParams';
import { BindingNodeParent } from '../models/BindingNodeParent';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanParams } from '../models/PlanParams';
import { PlanServiceNode } from '../models/PlanServiceNode';

export function curryBuildPlanServiceNode(
  buildServiceNodeBindings: (
    params: BasePlanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    serviceBindings: Binding<unknown>[],
    parentNode: BindingNodeParent,
    chainedBindings: boolean,
  ) => PlanBindingNode[],
): (params: PlanParams) => PlanServiceNode {
  return (params: PlanParams): PlanServiceNode => {
    const bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints> =
      buildPlanBindingConstraintsList(params);

    const bindingConstraints: BindingConstraints =
      new BindingConstraintsImplementation(bindingConstraintsList.last);

    const chained: boolean =
      params.rootConstraints.isMultiple && params.rootConstraints.chained;

    const filteredServiceBindings: Binding<unknown>[] =
      buildFilteredServiceBindings(params, bindingConstraints, {
        chained,
      });

    const serviceNodeBindings: PlanBindingNode[] = [];

    const serviceNode: PlanServiceNode = {
      bindings: serviceNodeBindings,
      isContextFree: true,
      serviceIdentifier: params.rootConstraints.serviceIdentifier,
    };

    serviceNodeBindings.push(
      ...buildServiceNodeBindings(
        params,
        bindingConstraintsList,
        filteredServiceBindings,
        serviceNode,
        chained,
      ),
    );

    serviceNode.isContextFree =
      !bindingConstraintsList.last.elem.getAncestorsCalled;

    if (!params.rootConstraints.isMultiple) {
      checkServiceNodeSingleInjectionBindings(
        serviceNode,
        params.rootConstraints.isOptional ?? false,
        bindingConstraintsList.last,
      );

      const [planBindingNode]: PlanBindingNode[] = serviceNodeBindings;

      serviceNode.bindings = planBindingNode;
    }

    return serviceNode;
  };
}
