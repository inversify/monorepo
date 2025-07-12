import { LazyServiceIdentifier, ServiceIdentifier } from '@inversifyjs/common';

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
import { SingleInmutableLinkedList } from '../../common/models/SingleInmutableLinkedList';
import { Writable } from '../../common/models/Writable';
import { ClassElementMetadata } from '../../metadata/models/ClassElementMetadata';
import { ClassElementMetadataKind } from '../../metadata/models/ClassElementMetadataKind';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { MetadataTag } from '../../metadata/models/MetadataTag';
import { ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata';
import { ResolvedValueElementMetadataKind } from '../../metadata/models/ResolvedValueElementMetadataKind';
import { ResolvedValueMetadata } from '../../metadata/models/ResolvedValueMetadata';
import { BasePlanParams } from '../models/BasePlanParams';
import { BindingNodeParent } from '../models/BindingNodeParent';
import { InstanceBindingNode } from '../models/InstanceBindingNode';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanParams } from '../models/PlanParams';
import { PlanResult } from '../models/PlanResult';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { PlanServiceRedirectionBindingNode } from '../models/PlanServiceRedirectionBindingNode';
import { ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode';
import { SubplanParams } from '../models/SubplanParams';
import { buildFilteredServiceBindings } from './buildFilteredServiceBindings';
import { checkServiceNodeSingleInjectionBindings } from './checkServiceNodeSingleInjectionBindings';
import { handlePlanError } from './handlePlanError';
import { isInstanceBindingNode } from './isInstanceBindingNode';
import { isPlanServiceRedirectionBindingNode } from './isPlanServiceRedirectionBindingNode';

export function plan(params: PlanParams): PlanResult {
  try {
    const tags: Map<MetadataTag, unknown> = new Map();

    if (params.rootConstraints.tag !== undefined) {
      tags.set(
        params.rootConstraints.tag.key,
        params.rootConstraints.tag.value,
      );
    }

    const bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints> =
      new SingleInmutableLinkedList({
        elem: {
          name: params.rootConstraints.name,
          serviceIdentifier: params.rootConstraints.serviceIdentifier,
          tags,
        },
        previous: undefined,
      });

    const bindingConstraints: BindingConstraints =
      new BindingConstraintsImplementation(bindingConstraintsList.last);

    const chained: boolean = params.rootConstraints.isMultiple
      ? params.rootConstraints.chained
      : false;

    const filteredServiceBindings: Binding<unknown>[] =
      buildFilteredServiceBindings(params, bindingConstraints, {
        chained,
      });

    const serviceNodeBindings: PlanBindingNode[] = [];

    const serviceNode: PlanServiceNode = {
      bindings: serviceNodeBindings,
      chained,
      parent: undefined,
      serviceIdentifier: params.rootConstraints.serviceIdentifier,
    };

    serviceNodeBindings.push(
      ...buildServiceNodeBindings(
        params,
        bindingConstraintsList,
        filteredServiceBindings,
        serviceNode,
      ),
    );

    if (!params.rootConstraints.isMultiple) {
      checkServiceNodeSingleInjectionBindings(
        serviceNode,
        params.rootConstraints.isOptional ?? false,
        bindingConstraints,
      );

      const [planBindingNode]: PlanBindingNode[] = serviceNodeBindings;

      (serviceNode as Writable<PlanServiceNode>).bindings = planBindingNode;
    }

    return {
      tree: {
        root: serviceNode,
      },
    };
  } catch (error: unknown) {
    handlePlanError(params, error);
  }
}

function buildInstancePlanBindingNode(
  params: BasePlanParams,
  binding: InstanceBinding<unknown>,
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
  parentNode: BindingNodeParent,
): PlanBindingNode {
  const classMetadata: ClassMetadata = params.getClassMetadata(
    binding.implementationType,
  );

  const childNode: InstanceBindingNode = {
    binding: binding,
    classMetadata,
    constructorParams: [],
    parent: parentNode,
    propertyParams: new Map(),
  };

  const subplanParams: SubplanParams = {
    autobindOptions: params.autobindOptions,
    getBindings: params.getBindings,
    getBindingsChained: params.getBindingsChained,
    getClassMetadata: params.getClassMetadata,
    node: childNode,
    servicesBranch: params.servicesBranch,
    setBinding: params.setBinding,
  };

  return subplan(subplanParams, bindingConstraintsList);
}

function buildPlanServiceNodeFromClassElementMetadata(
  params: SubplanParams,
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
  elementMetadata: ClassElementMetadata,
): PlanServiceNode | undefined {
  if (elementMetadata.kind === ClassElementMetadataKind.unmanaged) {
    return undefined;
  }

  const serviceIdentifier: ServiceIdentifier = LazyServiceIdentifier.is(
    elementMetadata.value,
  )
    ? elementMetadata.value.unwrap()
    : elementMetadata.value;

  const updatedBindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints> =
    bindingConstraintsList.concat({
      name: elementMetadata.name,
      serviceIdentifier,
      tags: elementMetadata.tags,
    });

  const bindingConstraints: BindingConstraints =
    new BindingConstraintsImplementation(updatedBindingConstraintsList.last);

  const chained: boolean =
    elementMetadata.kind === ClassElementMetadataKind.multipleInjection
      ? elementMetadata.chained
      : false;

  const filteredServiceBindings: Binding<unknown>[] =
    buildFilteredServiceBindings(params, bindingConstraints, {
      chained,
    });

  const serviceNodeBindings: PlanBindingNode[] = [];

  const serviceNode: PlanServiceNode = {
    bindings: serviceNodeBindings,
    chained,
    parent: params.node,
    serviceIdentifier,
  };

  serviceNodeBindings.push(
    ...buildServiceNodeBindings(
      params,
      updatedBindingConstraintsList,
      filteredServiceBindings,
      serviceNode,
    ),
  );

  if (elementMetadata.kind === ClassElementMetadataKind.singleInjection) {
    checkServiceNodeSingleInjectionBindings(
      serviceNode,
      elementMetadata.optional,
      bindingConstraints,
      { chained },
    );

    const [planBindingNode]: PlanBindingNode[] = serviceNodeBindings;

    (serviceNode as Writable<PlanServiceNode>).bindings = planBindingNode;
  }

  return serviceNode;
}

function buildPlanServiceNodeFromResolvedValueElementMetadata(
  params: SubplanParams,
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
  elementMetadata: ResolvedValueElementMetadata,
): PlanServiceNode {
  const serviceIdentifier: ServiceIdentifier = LazyServiceIdentifier.is(
    elementMetadata.value,
  )
    ? elementMetadata.value.unwrap()
    : elementMetadata.value;

  const updatedBindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints> =
    bindingConstraintsList.concat({
      name: elementMetadata.name,
      serviceIdentifier,
      tags: elementMetadata.tags,
    });

  const bindingConstraints: BindingConstraints =
    new BindingConstraintsImplementation(updatedBindingConstraintsList.last);

  const chained: boolean =
    elementMetadata.kind === ResolvedValueElementMetadataKind.multipleInjection
      ? elementMetadata.chained
      : false;

  const filteredServiceBindings: Binding<unknown>[] =
    buildFilteredServiceBindings(params, bindingConstraints, {
      chained,
    });

  const serviceNodeBindings: PlanBindingNode[] = [];

  const serviceNode: PlanServiceNode = {
    bindings: serviceNodeBindings,
    chained,
    parent: params.node,
    serviceIdentifier,
  };

  serviceNodeBindings.push(
    ...buildServiceNodeBindings(
      params,
      updatedBindingConstraintsList,
      filteredServiceBindings,
      serviceNode,
    ),
  );

  if (
    elementMetadata.kind === ResolvedValueElementMetadataKind.singleInjection
  ) {
    checkServiceNodeSingleInjectionBindings(
      serviceNode,
      elementMetadata.optional,
      bindingConstraints,
      { chained },
    );

    const [planBindingNode]: PlanBindingNode[] = serviceNodeBindings;

    (serviceNode as Writable<PlanServiceNode>).bindings = planBindingNode;
  }

  return serviceNode;
}

function buildResolvedValuePlanBindingNode(
  params: BasePlanParams,
  binding: ResolvedValueBinding<unknown>,
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
  parentNode: BindingNodeParent,
): PlanBindingNode {
  const childNode: ResolvedValueBindingNode = {
    binding: binding,
    params: [],
    parent: parentNode,
  };

  const subplanParams: SubplanParams = {
    autobindOptions: params.autobindOptions,
    getBindings: params.getBindings,
    getBindingsChained: params.getBindingsChained,
    getClassMetadata: params.getClassMetadata,
    node: childNode,
    servicesBranch: params.servicesBranch,
    setBinding: params.setBinding,
  };

  return subplan(subplanParams, bindingConstraintsList);
}

function buildServiceNodeBindings(
  params: BasePlanParams,
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
  serviceBindings: Binding<unknown>[],
  parentNode: BindingNodeParent,
): PlanBindingNode[] {
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
            parentNode,
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
            parentNode,
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
            parentNode,
          );

        planBindingNodes.push(planBindingNode);

        break;
      }
      default:
        planBindingNodes.push({
          binding: binding,
          parent: parentNode,
        });
    }
  }

  params.servicesBranch.pop();

  return planBindingNodes;
}

function buildServiceRedirectionPlanBindingNode(
  params: BasePlanParams,
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
  binding: ServiceRedirectionBinding<unknown>,
  parentNode: BindingNodeParent,
): PlanBindingNode {
  const childNode: PlanServiceRedirectionBindingNode = {
    binding,
    parent: parentNode,
    redirections: [],
  };

  const bindingConstraints: BindingConstraints =
    new BindingConstraintsImplementation(bindingConstraintsList.last);

  /*
   * TODO: We need to determine whether or not bindings are chained.
   * We can do that by checking the metadata in the ancestor nodes.
   *
   * Algorithm:
   * Traverse parent nodes until a PlanServiceNode is found. Bindings are chained if the parent node is chained.
   */

  const filteredServiceBindings: Binding<unknown>[] =
    buildFilteredServiceBindings(params, bindingConstraints, {
      chained: false,
      customServiceIdentifier: binding.targetServiceIdentifier,
    });

  childNode.redirections.push(
    ...buildServiceNodeBindings(
      params,
      bindingConstraintsList,
      filteredServiceBindings,
      childNode,
    ),
  );

  return childNode;
}

function subplan(
  params: SubplanParams,
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
): PlanBindingNode {
  if (isInstanceBindingNode(params.node)) {
    return subplanInstanceBindingNode(
      params,
      params.node,
      bindingConstraintsList,
    );
  } else {
    return subplanResolvedValueBindingNode(
      params,
      params.node,
      bindingConstraintsList,
    );
  }
}

function subplanInstanceBindingNode(
  params: SubplanParams,
  node: InstanceBindingNode,
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
): PlanBindingNode {
  const classMetadata: ClassMetadata = node.classMetadata;

  for (const [
    index,
    elementMetadata,
  ] of classMetadata.constructorArguments.entries()) {
    node.constructorParams[index] =
      buildPlanServiceNodeFromClassElementMetadata(
        params,
        bindingConstraintsList,
        elementMetadata,
      );
  }

  for (const [propertyKey, elementMetadata] of classMetadata.properties) {
    const planServiceNode: PlanServiceNode | undefined =
      buildPlanServiceNodeFromClassElementMetadata(
        params,
        bindingConstraintsList,
        elementMetadata,
      );

    if (planServiceNode !== undefined) {
      node.propertyParams.set(propertyKey, planServiceNode);
    }
  }

  return params.node;
}

function subplanResolvedValueBindingNode(
  params: SubplanParams,
  node: ResolvedValueBindingNode,
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
): PlanBindingNode {
  const resolvedValueMetadata: ResolvedValueMetadata = node.binding.metadata;

  for (const [
    index,
    elementMetadata,
  ] of resolvedValueMetadata.arguments.entries()) {
    node.params[index] = buildPlanServiceNodeFromResolvedValueElementMetadata(
      params,
      bindingConstraintsList,
      elementMetadata,
    );
  }

  return params.node;
}
