import { Binding } from '../../binding/models/Binding';
import { InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList';
import { ManagedClassElementMetadata } from '../../metadata/models/ManagedClassElementMetadata';
import { ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata';
import { buildGetPlanOptionsFromPlanParams } from '../calculations/buildGetPlanOptionsFromPlanParams';
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
import { curryBuildPlanServiceNodeFromClassElementMetadata } from './curryBuildPlanServiceNodeFromClassElementMetadata';
import { curryBuildPlanServiceNodeFromResolvedValueElementMetadata } from './curryBuildPlanServiceNodeFromResolvedValueElementMetadata';
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

export const buildPlanServiceNodeFromClassElementMetadata: (
  params: SubplanParams,
  bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  elementMetadata: ManagedClassElementMetadata,
) => PlanServiceNode = curryBuildPlanServiceNodeFromClassElementMetadata(
  circularBuildServiceNodeBindings,
);

export const buildPlanServiceNodeFromResolvedValueElementMetadata: (
  params: SubplanParams,
  bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  elementMetadata: ResolvedValueElementMetadata,
) => PlanServiceNode =
  curryBuildPlanServiceNodeFromResolvedValueElementMetadata(
    circularBuildServiceNodeBindings,
  );

const subplan: (
  params: SubplanParams,
  bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
) => PlanBindingNode = currySubplan(
  buildPlanServiceNodeFromClassElementMetadata,
  buildPlanServiceNodeFromResolvedValueElementMetadata,
  buildPlanServiceNodeFromClassElementMetadata,
  buildPlanServiceNodeFromResolvedValueElementMetadata,
);

const buildServiceNodeBindings: (
  params: BasePlanParams,
  bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  serviceBindings: Binding<unknown>[],
  parentNode: BindingNodeParent,
  chainedBindings: boolean,
) => PlanBindingNode[] = curryBuildServiceNodeBindings(subplan);

function circularBuildServiceNodeBindings(
  params: BasePlanParams,
  bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  serviceBindings: Binding<unknown>[],
  parentNode: BindingNodeParent,
  chainedBindings: boolean,
): PlanBindingNode[] {
  return buildServiceNodeBindings(
    params,
    bindingConstraintsList,
    serviceBindings,
    parentNode,
    chainedBindings,
  );
}

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
