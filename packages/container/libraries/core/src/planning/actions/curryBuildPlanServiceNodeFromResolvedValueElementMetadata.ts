import { ServiceIdentifier } from '@inversifyjs/common';

import { Binding } from '../../binding/models/Binding';
import { BindingConstraints } from '../../binding/models/BindingConstraints';
import {
  BindingConstraintsImplementation,
  InternalBindingConstraints,
} from '../../binding/models/BindingConstraintsImplementation';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList';
import { ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata';
import { ResolvedValueElementMetadataKind } from '../../metadata/models/ResolvedValueElementMetadataKind';
import { buildFilteredServiceBindings } from '../calculations/buildFilteredServiceBindings';
import { checkServiceNodeSingleInjectionBindings } from '../calculations/checkServiceNodeSingleInjectionBindings';
import { getServiceFromMaybeLazyServiceIdentifier } from '../calculations/getServiceFromMaybeLazyServiceIdentifier';
import { BasePlanParams } from '../models/BasePlanParams';
import { BindingNodeParent } from '../models/BindingNodeParent';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { SubplanParams } from '../models/SubplanParams';

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
