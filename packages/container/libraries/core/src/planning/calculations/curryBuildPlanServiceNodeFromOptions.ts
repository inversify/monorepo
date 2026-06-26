import { type ServiceIdentifier } from '@inversifyjs/common';

import { type Binding } from '../../binding/models/Binding.js';
import { type BindingConstraints } from '../../binding/models/BindingConstraints.js';
import {
  BindingConstraintsImplementation,
  type InternalBindingConstraints,
} from '../../binding/models/BindingConstraintsImplementation.js';
import { type SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { type BasePlanParams } from '../models/BasePlanParams.js';
import { type BindingNodeParent } from '../models/BindingNodeParent.js';
import { type BuildServiceNodeOptions } from '../models/BuildServiceNodeOptions.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type SubplanParams } from '../models/SubplanParams.js';
import { buildFilteredServiceBindings } from './buildFilteredServiceBindings.js';
import { checkServiceNodeSingleInjectionBindings } from './checkServiceNodeSingleInjectionBindings.js';

export function curryBuildPlanServiceNodeFromOptions(
  buildServiceNodeBindings: (
    params: BasePlanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    serviceBindings: Binding<unknown>[],
    parentNode: BindingNodeParent,
    chainedBindings: boolean,
  ) => PlanBindingNode[],
): (
  params: SubplanParams,
  bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  options: BuildServiceNodeOptions,
) => PlanServiceNode {
  return (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    options: BuildServiceNodeOptions,
  ): PlanServiceNode => {
    const serviceIdentifier: ServiceIdentifier = options.serviceIdentifier;

    const updatedBindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints> =
      bindingConstraintsList.concat({
        getAncestorsCalled: false,
        name: options.name,
        serviceIdentifier,
        tags: options.tags,
      });

    const bindingConstraints: BindingConstraints =
      new BindingConstraintsImplementation(updatedBindingConstraintsList.last);

    const chained: boolean = options.isMultiple && options.chained;

    const filteredServiceBindings: Binding<unknown>[] =
      buildFilteredServiceBindings(params, bindingConstraints, {
        chained,
      });

    const serviceNodeBindings: PlanBindingNode[] = [];

    const serviceNode: PlanServiceNode = {
      bindings: serviceNodeBindings,
      isContextFree: true,
      serviceIdentifier,
    };

    serviceNodeBindings.push(
      ...buildServiceNodeBindings(
        params,
        updatedBindingConstraintsList,
        filteredServiceBindings,
        serviceNode,
        chained,
      ),
    );

    serviceNode.isContextFree =
      !updatedBindingConstraintsList.last.elem.getAncestorsCalled;

    if (!options.isMultiple) {
      checkServiceNodeSingleInjectionBindings(
        serviceNode,
        options.optional,
        updatedBindingConstraintsList.last,
      );

      const [planBindingNode]: PlanBindingNode[] = serviceNodeBindings;

      serviceNode.bindings = planBindingNode;
    }

    return serviceNode;
  };
}
