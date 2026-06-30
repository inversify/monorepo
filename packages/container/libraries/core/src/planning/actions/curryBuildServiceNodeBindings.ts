import { type ServiceIdentifier } from '@inversifyjs/common';

import { type Binding } from '../../binding/models/Binding.js';
import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import {
  type BindingType,
  bindingTypeValues,
} from '../../binding/models/BindingType.js';
import { type Factory } from '../../binding/models/Factory.js';
import { type FactoryBinding } from '../../binding/models/FactoryBinding.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ResolvedValueBinding } from '../../binding/models/ResolvedValueBinding.js';
import { type ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding.js';
import { type SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { isPlanServiceRedirectionBindingNode } from '../calculations/isPlanServiceRedirectionBindingNode.js';
import { type BasePlanParams } from '../models/BasePlanParams.js';
import { type BindingNodeParent } from '../models/BindingNodeParent.js';
import { type BuildServiceNodeOptions } from '../models/BuildServiceNodeOptions.js';
import { ConstantValueBindingNode } from '../models/ConstantValueBindingNode.js';
import { DynamicValueBindingNode } from '../models/DynamicValueBindingNode.js';
import { FactoryBindingNodeImplementation } from '../models/FactoryBindingNodeImplementation.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { InstanceBindingNodeImplementation } from '../models/InstanceBindingNodeImplementation.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type PlanServiceRedirectionBindingNode } from '../models/PlanServiceRedirectionBindingNode.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { ResolvedValueBindingNodeImplementation } from '../models/ResolvedValueBindingNodeImplementation.js';
import {
  type RedirectionSubplanParams,
  type SubplanParams,
} from '../models/SubplanParams.js';

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
  buildServiceNodeOptions: BuildServiceNodeOptions,
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
    buildServiceNodeOptions: BuildServiceNodeOptions,
  ) => PlanBindingNode[] = (
    params: BasePlanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    serviceBindings: Binding<unknown>[],
    parentNode: BindingNodeParent,
    buildServiceNodeOptions: BuildServiceNodeOptions,
  ): PlanBindingNode[] => {
    const serviceIdentifier: ServiceIdentifier =
      isPlanServiceRedirectionBindingNode(parentNode)
        ? parentNode.binding.targetServiceIdentifier
        : parentNode.serviceIdentifier;

    params.servicesBranch.push(serviceIdentifier);

    const planBindingNodes: PlanBindingNode[] = [];

    for (const binding of serviceBindings) {
      if ((binding.type as BindingType) === bindingTypeValues.Factory) {
        planBindingNodes.push(
          new FactoryBindingNodeImplementation(
            binding as unknown as FactoryBinding<Factory<unknown>>,
          ),
        );
        continue;
      }

      switch (binding.type) {
        case bindingTypeValues.ConstantValue: {
          planBindingNodes.push(new ConstantValueBindingNode(binding));
          break;
        }
        case bindingTypeValues.DynamicValue: {
          planBindingNodes.push(new DynamicValueBindingNode(binding));
          break;
        }
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
              buildServiceNodeOptions,
            );

          planBindingNodes.push(planBindingNode);

          break;
        }
      }
    }

    params.servicesBranch.pop();

    return planBindingNodes;
  };

  const buildServiceRedirectionPlanBindingNode: (
    params: BasePlanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    binding: ServiceRedirectionBinding<unknown>,
    buildServiceNodeOptions: BuildServiceNodeOptions,
  ) => PlanBindingNode = curryBuildServiceRedirectionPlanBindingNode(subplan);

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

    const childNode: InstanceBindingNode =
      new InstanceBindingNodeImplementation(binding, classMetadata);

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
    const childNode: ResolvedValueBindingNode =
      new ResolvedValueBindingNodeImplementation(binding);

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
  subplan: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  ) => PlanBindingNode,
): (
  params: BasePlanParams,
  bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  binding: ServiceRedirectionBinding<unknown>,
  buildServiceNodeOptions: BuildServiceNodeOptions,
) => PlanBindingNode {
  return (
    params: BasePlanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    binding: ServiceRedirectionBinding<unknown>,
    buildServiceNodeOptions: BuildServiceNodeOptions,
  ): PlanBindingNode => {
    const childNode: PlanServiceRedirectionBindingNode = {
      binding,
      redirection: undefined as unknown as PlanServiceNode,
    };

    const subplanParams: RedirectionSubplanParams = {
      autobindOptions: params.autobindOptions,
      buildServiceNodeOptions: {
        ...buildServiceNodeOptions,
        serviceIdentifier: binding.targetServiceIdentifier,
      },
      node: childNode,
      operations: params.operations,
      servicesBranch: params.servicesBranch,
    };

    return subplan(subplanParams, bindingConstraintsList);
  };
}
