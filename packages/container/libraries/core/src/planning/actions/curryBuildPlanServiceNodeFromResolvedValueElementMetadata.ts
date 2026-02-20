import { type ServiceIdentifier } from '@inversifyjs/common';

import { type Binding } from '../../binding/models/Binding.js';
import { type BindingConstraints } from '../../binding/models/BindingConstraints.js';
import {
  BindingConstraintsImplementation,
  type InternalBindingConstraints,
} from '../../binding/models/BindingConstraintsImplementation.js';
import { type SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { type ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata.js';
import { ResolvedValueElementMetadataKind } from '../../metadata/models/ResolvedValueElementMetadataKind.js';
import { buildFilteredServiceBindings } from '../calculations/buildFilteredServiceBindings.js';
import { checkServiceNodeSingleInjectionBindings } from '../calculations/checkServiceNodeSingleInjectionBindings.js';
import { getServiceFromMaybeLazyServiceIdentifier } from '../calculations/getServiceFromMaybeLazyServiceIdentifier.js';
import { type BasePlanParams } from '../models/BasePlanParams.js';
import { type BindingNodeParent } from '../models/BindingNodeParent.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type SubplanParams } from '../models/SubplanParams.js';

export function curryBuildPlanServiceNodeFromResolvedValueElementMetadata(
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
  elementMetadata: ResolvedValueElementMetadata,
) => PlanServiceNode {
  return (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ResolvedValueElementMetadata,
  ): PlanServiceNode => {
    const serviceIdentifier: ServiceIdentifier =
      getServiceFromMaybeLazyServiceIdentifier(elementMetadata.value);

    const updatedBindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints> =
      bindingConstraintsList.concat({
        getAncestorsCalled: false,
        name: elementMetadata.name,
        serviceIdentifier,
        tags: elementMetadata.tags,
      });

    const bindingConstraints: BindingConstraints =
      new BindingConstraintsImplementation(updatedBindingConstraintsList.last);

    const chained: boolean =
      elementMetadata.kind ===
        ResolvedValueElementMetadataKind.multipleInjection &&
      elementMetadata.chained;

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

    if (
      elementMetadata.kind === ResolvedValueElementMetadataKind.singleInjection
    ) {
      checkServiceNodeSingleInjectionBindings(
        serviceNode,
        elementMetadata.optional,
        updatedBindingConstraintsList.last,
      );

      const [planBindingNode]: PlanBindingNode[] = serviceNodeBindings;

      serviceNode.bindings = planBindingNode;
    }

    return serviceNode;
  };
}
