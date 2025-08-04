import { ServiceIdentifier } from '@inversifyjs/common';

import { Binding } from '../../binding/models/Binding';
import { BindingConstraints } from '../../binding/models/BindingConstraints';
import {
  BindingConstraintsImplementation,
  InternalBindingConstraints,
} from '../../binding/models/BindingConstraintsImplementation';
import { SingleInmutableLinkedList } from '../../common/models/SingleInmutableLinkedList';
import { Writable } from '../../common/models/Writable';
import { ClassElementMetadataKind } from '../../metadata/models/ClassElementMetadataKind';
import { ManagedClassElementMetadata } from '../../metadata/models/ManagedClassElementMetadata';
import { ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata';
import { ResolvedValueElementMetadataKind } from '../../metadata/models/ResolvedValueElementMetadataKind';
import { buildFilteredServiceBindings } from '../calculations/buildFilteredServiceBindings';
import { buildGetPlanOptionsFromPlanParams } from '../calculations/buildGetPlanOptionsFromPlanParams';
import { checkServiceNodeSingleInjectionBindings } from '../calculations/checkServiceNodeSingleInjectionBindings';
import { getServiceFromMaybeLazyServiceIdentifier } from '../calculations/getServiceFromMaybeLazyServiceIdentifier';
import { handlePlanError } from '../calculations/handlePlanError';
import { BasePlanParams } from '../models/BasePlanParams';
import { BindingNodeParent } from '../models/BindingNodeParent';
import { GetPlanOptions } from '../models/GetPlanOptions';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanParams } from '../models/PlanParams';
import { PlanResult } from '../models/PlanResult';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { SubplanParams } from '../models/SubplanParams';
import { curryBuildPlanServiceNode } from './curryBuildPlanServiceNode';
import { curryBuildServiceNodeBindings } from './curryBuildServiceNodeBindings';
import { currySubplan } from './currySubplan';

class LazyRootPlanServiceNode extends LazyPlanServiceNode {
  readonly #params: PlanParams;

  constructor(params: PlanParams, serviceNode: PlanServiceNode) {
    super(serviceNode, serviceNode.serviceIdentifier);

    this.#params = params;
  }

  protected override _buildPlanServiceNode(): PlanServiceNode {
    return buildPlanServiceNode(this.#params);
  }
}

const subplan: (
  params: SubplanParams,
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
) => PlanBindingNode = currySubplan(
  buildPlanServiceNodeFromClassElementMetadata,
  buildPlanServiceNodeFromResolvedValueElementMetadata,
  buildPlanServiceNodeFromClassElementMetadata,
  buildPlanServiceNodeFromResolvedValueElementMetadata,
);

const buildServiceNodeBindings: (
  params: BasePlanParams,
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
  serviceBindings: Binding<unknown>[],
  parentNode: BindingNodeParent,
  chainedBindings: boolean,
) => PlanBindingNode[] = curryBuildServiceNodeBindings(subplan);

const buildPlanServiceNode: (params: PlanParams) => PlanServiceNode =
  curryBuildPlanServiceNode(buildServiceNodeBindings);

export function plan(params: PlanParams): PlanResult {
  try {
    const getPlanOptions: GetPlanOptions =
      buildGetPlanOptionsFromPlanParams(params);

    const planResultFromCache: PlanResult | undefined =
      params.operations.getPlan(getPlanOptions);

    if (planResultFromCache !== undefined) {
      return planResultFromCache;
    }

    const serviceNode: PlanServiceNode = buildPlanServiceNode(params);

    const planResult: PlanResult = {
      tree: {
        root: new LazyRootPlanServiceNode(params, serviceNode),
      },
    };

    // Set the plan result in the cache no matter what, even if the plan is context dependent
    params.operations.setPlan(getPlanOptions, planResult);

    return planResult;
  } catch (error: unknown) {
    handlePlanError(params, error);
  }
}

function buildPlanServiceNodeFromClassElementMetadata(
  params: SubplanParams,
  bindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints>,
  elementMetadata: ManagedClassElementMetadata,
): PlanServiceNode {
  const serviceIdentifier: ServiceIdentifier =
    getServiceFromMaybeLazyServiceIdentifier(elementMetadata.value);

  const updatedBindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints> =
    bindingConstraintsList.concat({
      getAncestorsCalled: false,
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

  if (elementMetadata.kind === ClassElementMetadataKind.singleInjection) {
    checkServiceNodeSingleInjectionBindings(
      serviceNode,
      elementMetadata.optional,
      updatedBindingConstraintsList.last,
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
  const serviceIdentifier: ServiceIdentifier =
    getServiceFromMaybeLazyServiceIdentifier(elementMetadata.value);

  const updatedBindingConstraintsList: SingleInmutableLinkedList<InternalBindingConstraints> =
    bindingConstraintsList.concat({
      getAncestorsCalled: false,
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

    (serviceNode as Writable<PlanServiceNode>).bindings = planBindingNode;
  }

  return serviceNode;
}
