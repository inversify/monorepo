import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import { buildBuildServiceNodeOptionsFromClassElementMetadata } from '../../common/calculations/buildBuildServiceNodeOptionsFromClassElementMetadata.js';
import { buildBuildServiceNodeOptionsFromResolvedValueElementMetadata } from '../../common/calculations/buildBuildServiceNodeOptionsFromResolvedValueElementMetadata.js';
import { type SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type ClassElementMetadata } from '../../metadata/models/ClassElementMetadata.js';
import { ClassElementMetadataKind } from '../../metadata/models/ClassElementMetadataKind.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { type ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata.js';
import { ResolvedValueElementMetadataKind } from '../../metadata/models/ResolvedValueElementMetadataKind.js';
import { type ResolvedValueMetadata } from '../../metadata/models/ResolvedValueMetadata.js';
import { isInstanceBindingNode } from '../calculations/isInstanceBindingNode.js';
import { tryBuildGetPlanOptionsFromManagedClassElementMetadata } from '../calculations/tryBuildGetPlanOptionsFromManagedClassElementMetadata.js';
import { tryBuildGetPlanOptionsFromResolvedValueElementMetadata } from '../calculations/tryBuildGetPlanOptionsFromResolvedValueElementMetadata.js';
import { type BuildServiceNodeOptions } from '../models/BuildServiceNodeOptions.js';
import { type GetPlanOptions } from '../models/GetPlanOptions.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanResult } from '../models/PlanResult.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode.js';
import { type SubplanParams } from '../models/SubplanParams.js';
import { cacheNonRootPlanServiceNode } from './cacheNonRootPlanServiceNode.js';

const MAX_PLAN_DEPTH: number = 500;

class LazySubPlanServiceNode extends LazyPlanServiceNode {
  readonly #params: SubplanParams;
  readonly #buildLazyPlanServiceNodeNodeFromOptions: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    options: BuildServiceNodeOptions,
  ) => PlanServiceNode;
  readonly #bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>;
  readonly #options: BuildServiceNodeOptions;

  constructor(
    params: SubplanParams,
    buildLazyPlanServiceNodeNodeFromOptions: (
      params: SubplanParams,
      bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
      options: BuildServiceNodeOptions,
    ) => PlanServiceNode,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    options: BuildServiceNodeOptions,
    serviceNode: PlanServiceNode | undefined,
  ) {
    super(serviceNode, options.serviceIdentifier);

    this.#buildLazyPlanServiceNodeNodeFromOptions =
      buildLazyPlanServiceNodeNodeFromOptions;
    this.#params = params;
    this.#bindingConstraintsList = bindingConstraintsList;
    this.#options = options;
  }

  protected override _buildPlanServiceNode(): PlanServiceNode {
    return this.#buildLazyPlanServiceNodeNodeFromOptions(
      this.#params,
      this.#bindingConstraintsList,
      this.#options,
    );
  }
}

export function currySubplan(
  buildLazyPlanServiceNodeNodeFromOptions: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    options: BuildServiceNodeOptions,
  ) => PlanServiceNode,
  buildPlanServiceNodeFromOptions: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    options: BuildServiceNodeOptions,
  ) => PlanServiceNode | undefined,
): (
  params: SubplanParams,
  bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
) => PlanBindingNode {
  const subplanInstanceBindingNode: (
    params: SubplanParams,
    node: InstanceBindingNode,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  ) => PlanBindingNode = currySubplanInstanceBindingNode(
    buildLazyPlanServiceNodeNodeFromOptions,
    buildPlanServiceNodeFromOptions,
  );

  const subplanResolvedValueBindingNode: (
    params: SubplanParams,
    node: ResolvedValueBindingNode,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  ) => PlanBindingNode = currySubplanResolvedValueBindingNode(
    buildLazyPlanServiceNodeNodeFromOptions,
    buildPlanServiceNodeFromOptions,
  );

  return (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  ): PlanBindingNode => {
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
  };
}

function currySubplanInstanceBindingNode(
  buildLazyPlanServiceNodeNodeFromOptions: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    options: BuildServiceNodeOptions,
  ) => PlanServiceNode,
  buildPlanServiceNodeFromOptions: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    options: BuildServiceNodeOptions,
  ) => PlanServiceNode | undefined,
): (
  params: SubplanParams,
  node: InstanceBindingNode,
  bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
) => PlanBindingNode {
  const handlePlanServiceNodeBuildFromClassElementMetadata: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ClassElementMetadata,
  ) => PlanServiceNode | undefined =
    curryHandlePlanServiceNodeBuildFromClassElementMetadata(
      buildLazyPlanServiceNodeNodeFromOptions,
      buildPlanServiceNodeFromOptions,
    );

  return (
    params: SubplanParams,
    node: InstanceBindingNode,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  ): PlanBindingNode => {
    const classMetadata: ClassMetadata = node.classMetadata;

    for (const [
      index,
      elementMetadata,
    ] of classMetadata.constructorArguments.entries()) {
      node.constructorParams[index] =
        handlePlanServiceNodeBuildFromClassElementMetadata(
          params,
          bindingConstraintsList,
          elementMetadata,
        );
    }

    for (const [propertyKey, elementMetadata] of classMetadata.properties) {
      const planServiceNode: PlanServiceNode | undefined =
        handlePlanServiceNodeBuildFromClassElementMetadata(
          params,
          bindingConstraintsList,
          elementMetadata,
        );

      if (planServiceNode !== undefined) {
        node.propertyParams.set(propertyKey, planServiceNode);
      }
    }

    return params.node;
  };
}

function currySubplanResolvedValueBindingNode(
  buildLazyPlanServiceNodeNodeFromOptions: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    options: BuildServiceNodeOptions,
  ) => PlanServiceNode,
  buildPlanServiceNodeFromOptions: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    options: BuildServiceNodeOptions,
  ) => PlanServiceNode | undefined,
): (
  params: SubplanParams,
  node: ResolvedValueBindingNode,
  bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
) => PlanBindingNode {
  const handlePlanServiceNodeBuildFromResolvedValueElementMetadata: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ResolvedValueElementMetadata,
  ) => PlanServiceNode =
    curryHandlePlanServiceNodeBuildFromResolvedValueElementMetadata(
      buildLazyPlanServiceNodeNodeFromOptions,
      buildPlanServiceNodeFromOptions,
    );

  return (
    params: SubplanParams,
    node: ResolvedValueBindingNode,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  ): PlanBindingNode => {
    const resolvedValueMetadata: ResolvedValueMetadata = node.binding.metadata;

    for (const [
      index,
      elementMetadata,
    ] of resolvedValueMetadata.arguments.entries()) {
      node.params[index] =
        handlePlanServiceNodeBuildFromResolvedValueElementMetadata(
          params,
          bindingConstraintsList,
          elementMetadata,
        );
    }

    return params.node;
  };
}

function curryHandlePlanServiceNodeBuildFromClassElementMetadata(
  buildLazyPlanServiceNodeNodeFromOptions: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    options: BuildServiceNodeOptions,
  ) => PlanServiceNode,
  buildPlanServiceNodeFromOptions: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    options: BuildServiceNodeOptions,
  ) => PlanServiceNode | undefined,
): (
  params: SubplanParams,
  bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  elementMetadata: ClassElementMetadata,
) => PlanServiceNode | undefined {
  return (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ClassElementMetadata,
  ): PlanServiceNode | undefined => {
    if (elementMetadata.kind === ClassElementMetadataKind.unmanaged) {
      return undefined;
    }

    if (bindingConstraintsList.length > MAX_PLAN_DEPTH) {
      throw new InversifyCoreError(
        InversifyCoreErrorKind.planningMaxDepthExceeded,
        'Maximum plan depth exceeded. This is likely caused by a circular dependency.',
      );
    }

    const getPlanOptions: GetPlanOptions | undefined =
      tryBuildGetPlanOptionsFromManagedClassElementMetadata(elementMetadata);

    if (getPlanOptions !== undefined) {
      const planResult: PlanResult | undefined =
        params.operations.getPlan(getPlanOptions);

      if (planResult !== undefined && planResult.tree.root.isContextFree) {
        return planResult.tree.root;
      }
    }

    const options: BuildServiceNodeOptions =
      buildBuildServiceNodeOptionsFromClassElementMetadata(elementMetadata);

    const serviceNode: PlanServiceNode | undefined =
      buildPlanServiceNodeFromOptions(params, bindingConstraintsList, options);

    const lazyPlanServiceNode: LazyPlanServiceNode = new LazySubPlanServiceNode(
      params,
      buildLazyPlanServiceNodeNodeFromOptions,
      bindingConstraintsList,
      options,
      serviceNode,
    );

    cacheNonRootPlanServiceNode(
      getPlanOptions,
      params.operations,
      lazyPlanServiceNode,
      {
        bindingConstraintsList,
        chainedBindings:
          elementMetadata.kind === ClassElementMetadataKind.multipleInjection &&
          elementMetadata.chained,
        optionalBindings: elementMetadata.optional,
      },
    );

    return lazyPlanServiceNode;
  };
}

function curryHandlePlanServiceNodeBuildFromResolvedValueElementMetadata(
  buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadata: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    options: BuildServiceNodeOptions,
  ) => PlanServiceNode,
  buildPlanServiceNodeFromOptions: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    options: BuildServiceNodeOptions,
  ) => PlanServiceNode | undefined,
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
    const getPlanOptions: GetPlanOptions | undefined =
      tryBuildGetPlanOptionsFromResolvedValueElementMetadata(elementMetadata);

    if (getPlanOptions !== undefined) {
      const planResult: PlanResult | undefined =
        params.operations.getPlan(getPlanOptions);

      if (planResult !== undefined && planResult.tree.root.isContextFree) {
        return planResult.tree.root;
      }
    }

    const options: BuildServiceNodeOptions =
      buildBuildServiceNodeOptionsFromResolvedValueElementMetadata(
        elementMetadata,
      );

    const serviceNode: PlanServiceNode | undefined =
      buildPlanServiceNodeFromOptions(params, bindingConstraintsList, options);

    const lazyPlanServiceNode: LazyPlanServiceNode = new LazySubPlanServiceNode(
      params,
      buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadata,
      bindingConstraintsList,
      options,
      serviceNode,
    );

    cacheNonRootPlanServiceNode(
      getPlanOptions,
      params.operations,
      lazyPlanServiceNode,
      {
        bindingConstraintsList,
        chainedBindings:
          elementMetadata.kind ===
            ResolvedValueElementMetadataKind.multipleInjection &&
          elementMetadata.chained,
        optionalBindings: elementMetadata.optional,
      },
    );

    return lazyPlanServiceNode;
  };
}
