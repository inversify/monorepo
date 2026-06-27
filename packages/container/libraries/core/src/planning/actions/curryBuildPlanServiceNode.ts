import { type Binding } from '../../binding/models/Binding.js';
import { type BindingConstraints } from '../../binding/models/BindingConstraints.js';
import {
  BindingConstraintsImplementation,
  type InternalBindingConstraints,
} from '../../binding/models/BindingConstraintsImplementation.js';
import { buildBuildServiceNodeOptionsFromPlanParamsConstraints } from '../../common/calculations/buildBuildServiceNodeOptionsFromPlanParamsConstraints.js';
import { type SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { buildFilteredServiceBindings } from '../calculations/buildFilteredServiceBindings.js';
import { buildPlanBindingConstraintsList } from '../calculations/buildPlanBindingConstraintsList.js';
import { checkServiceNodeSingleInjectionBindings } from '../calculations/checkServiceNodeSingleInjectionBindings.js';
import { type BasePlanParams } from '../models/BasePlanParams.js';
import { type BindingNodeParent } from '../models/BindingNodeParent.js';
import { type BuildServiceNodeOptions } from '../models/BuildServiceNodeOptions.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanParams } from '../models/PlanParams.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';

export function curryBuildPlanServiceNode(
  buildServiceNodeBindings: (
    params: BasePlanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    serviceBindings: Binding<unknown>[],
    parentNode: BindingNodeParent,
    buildServiceNodeOptions: BuildServiceNodeOptions,
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
        buildBuildServiceNodeOptionsFromPlanParamsConstraints(
          params.rootConstraints,
        ),
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
