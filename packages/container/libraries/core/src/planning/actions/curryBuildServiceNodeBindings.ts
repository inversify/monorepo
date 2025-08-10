import { ServiceIdentifier } from '@inversifyjs/common';

import { Binding } from '../../binding/models/Binding';
import { BindingConstraints } from '../../binding/models/BindingConstraints';
import {
  BindingConstraintsImplementation,
  InternalBindingConstraints,
} from '../../binding/models/BindingConstraintsImplementation';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { InstanceBinding } from '../../binding/models/InstanceBinding';
import { ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding';
import { ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { buildFilteredServiceBindings } from '../calculations/buildFilteredServiceBindings';
import { isPlanServiceRedirectionBindingNode } from '../calculations/isPlanServiceRedirectionBindingNode';
import { BasePlanParams } from '../models/BasePlanParams';
import { BindingNodeParent } from '../models/BindingNodeParent';
import { InstanceBindingNode } from '../models/InstanceBindingNode';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanServiceRedirectionBindingNode } from '../models/PlanServiceRedirectionBindingNode';
import { ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode';
import { SubplanParams } from '../models/SubplanParams';

export function curryBuildServiceNodeBindings(
  subplan: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  ) => PlanBindingNode,
): (
  params: BasePlanParams,
  bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  serviceBindings: Binding<unknown>[],
  parentNode: BindingNodeParent,
  chainedBindings: boolean,
) => PlanBindingNode[] {
  const buildInstancePlanBindingNode: (
    params: BasePlanParams,
    binding: InstanceBinding<unknown>,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  ) => PlanBindingNode = curryBuildInstancePlanBindingNode(subplan);
  const buildResolvedValuePlanBindingNode: (
    params: BasePlanParams,
    binding: ResolvedValueBinding<unknown>,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  ) => PlanBindingNode = curryBuildResolvedValuePlanBindingNode(subplan);

  const buildServiceNodeBindings: (
    params: BasePlanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    serviceBindings: Binding<unknown>[],
    parentNode: BindingNodeParent,
    chainedBindings: boolean,
  ) => PlanBindingNode[] = (
    params: BasePlanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    serviceBindings: Binding<unknown>[],
    parentNode: BindingNodeParent,
    chainedBindings: boolean,
  ): PlanBindingNode[] => {
    const serviceIdentifier: ServiceIdentifier =
      isPlanServiceRedirectionBindingNode(parentNode)
        ? parentNode.binding.targetServiceIdentifier
        : parentNode.serviceIdentifier;

    params.servicesBranch.push(serviceIdentifier);

    const planBindingNodes: PlanBindingNode[] = [];

    for (const binding of serviceBindings) {
      switch (binding.type) {
        case bindingTypeValues.Instance: {
          planBindingNodes.push(
            buildInstancePlanBindingNode(
              params,
              binding,
              bindingConstraintsList,
            ),
          );
          break;
        }
        case bindingTypeValues.ResolvedValue: {
          planBindingNodes.push(
            buildResolvedValuePlanBindingNode(
              params,
              binding,
              bindingConstraintsList,
            ),
          );
          break;
        }
        case bindingTypeValues.ServiceRedirection: {
          const planBindingNode: PlanBindingNode | undefined =
            buildServiceRedirectionPlanBindingNode(
              params,
              bindingConstraintsList,
              binding,
              chainedBindings,
            );

          planBindingNodes.push(planBindingNode);

          break;
        }
        default:
          planBindingNodes.push({
            binding: binding,
          });
      }
    }

    params.servicesBranch.pop();

    return planBindingNodes;
  };

  const buildServiceRedirectionPlanBindingNode: (
    params: BasePlanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    binding: ServiceRedirectionBinding<unknown>,
    chainedBindings: boolean,
  ) => PlanBindingNode = curryBuildServiceRedirectionPlanBindingNode(
    buildServiceNodeBindings,
  );

  return buildServiceNodeBindings;
}

function curryBuildInstancePlanBindingNode(
  subplan: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  ) => PlanBindingNode,
): (
  params: BasePlanParams,
  binding: InstanceBinding<unknown>,
  bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
) => PlanBindingNode {
  return (
    params: BasePlanParams,
    binding: InstanceBinding<unknown>,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  ): PlanBindingNode => {
    const classMetadata: ClassMetadata = params.operations.getClassMetadata(
      binding.implementationType,
    );

    const childNode: InstanceBindingNode = {
      binding: binding,
      classMetadata,
      constructorParams: [],
      propertyParams: new Map(),
    };

    const subplanParams: SubplanParams = {
      autobindOptions: params.autobindOptions,
      node: childNode,
      operations: params.operations,
      servicesBranch: params.servicesBranch,
    };

    return subplan(subplanParams, bindingConstraintsList);
  };
}

function curryBuildResolvedValuePlanBindingNode(
  subplan: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  ) => PlanBindingNode,
): (
  params: BasePlanParams,
  binding: ResolvedValueBinding<unknown>,
  bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
) => PlanBindingNode {
  return (
    params: BasePlanParams,
    binding: ResolvedValueBinding<unknown>,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  ): PlanBindingNode => {
    const childNode: ResolvedValueBindingNode = {
      binding: binding,
      params: [],
    };

    const subplanParams: SubplanParams = {
      autobindOptions: params.autobindOptions,
      node: childNode,
      operations: params.operations,
      servicesBranch: params.servicesBranch,
    };

    return subplan(subplanParams, bindingConstraintsList);
  };
}

function curryBuildServiceRedirectionPlanBindingNode(
  buildServiceNodeBindings: (
    params: BasePlanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    serviceBindings: Binding<unknown>[],
    parentNode: BindingNodeParent,
    chainedBindings: boolean,
  ) => PlanBindingNode[],
): (
  params: BasePlanParams,
  bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  binding: ServiceRedirectionBinding<unknown>,
  chainedBindings: boolean,
) => PlanBindingNode {
  return (
    params: BasePlanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    binding: ServiceRedirectionBinding<unknown>,
    chainedBindings: boolean,
  ): PlanBindingNode => {
    const childNode: PlanServiceRedirectionBindingNode = {
      binding,
      redirections: [],
    };

    const bindingConstraints: BindingConstraints =
      new BindingConstraintsImplementation(bindingConstraintsList.last);

    const filteredServiceBindings: Binding<unknown>[] =
      buildFilteredServiceBindings(params, bindingConstraints, {
        chained: chainedBindings,
        customServiceIdentifier: binding.targetServiceIdentifier,
      });

    childNode.redirections.push(
      ...buildServiceNodeBindings(
        params,
        bindingConstraintsList,
        filteredServiceBindings,
        childNode,
        chainedBindings,
      ),
    );

    return childNode;
  };
}
