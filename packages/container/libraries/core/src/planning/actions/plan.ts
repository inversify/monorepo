import { type Binding } from '../../binding/models/Binding.js';
import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import { type SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { type ManagedClassElementMetadata } from '../../metadata/models/ManagedClassElementMetadata.js';
import { type ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata.js';
import { buildGetPlanOptionsFromPlanParams } from '../calculations/buildGetPlanOptionsFromPlanParams.js';
import { handlePlanError } from '../calculations/handlePlanError.js';
import { type BasePlanParams } from '../models/BasePlanParams.js';
import { type BindingNodeParent } from '../models/BindingNodeParent.js';
import { type GetPlanOptions } from '../models/GetPlanOptions.js';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanParams } from '../models/PlanParams.js';
import { type PlanResult } from '../models/PlanResult.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type SubplanParams } from '../models/SubplanParams.js';
import { curryBuildPlanServiceNode } from './curryBuildPlanServiceNode.js';
import { curryBuildPlanServiceNodeFromClassElementMetadata } from './curryBuildPlanServiceNodeFromClassElementMetadata.js';
import { curryBuildPlanServiceNodeFromResolvedValueElementMetadata } from './curryBuildPlanServiceNodeFromResolvedValueElementMetadata.js';
import { curryBuildServiceNodeBindings } from './curryBuildServiceNodeBindings.js';
import { currySubplan } from './currySubplan.js';

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
