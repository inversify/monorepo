import { type ServiceIdentifier } from '@inversifyjs/common';

import { type Binding } from '../../binding/models/Binding.js';
import { type BindingConstraints } from '../../binding/models/BindingConstraints.js';
import {
  BindingConstraintsImplementation,
  type InternalBindingConstraints,
} from '../../binding/models/BindingConstraintsImplementation.js';
import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding.js';
import { type SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { buildFilteredServiceBindings } from '../calculations/buildFilteredServiceBindings.js';
import { isPlanServiceRedirectionBindingNode } from '../calculations/isPlanServiceRedirectionBindingNode.js';
import { type BasePlanParams } from '../models/BasePlanParams.js';
import { type BindingNodeParent } from '../models/BindingNodeParent.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanServiceRedirectionBindingNode } from '../models/PlanServiceRedirectionBindingNode.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { type SubplanParams } from '../models/SubplanParams.js';

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
