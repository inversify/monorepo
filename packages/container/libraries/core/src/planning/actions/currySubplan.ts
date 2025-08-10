import { InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList';
import { ClassElementMetadata } from '../../metadata/models/ClassElementMetadata';
import { ClassElementMetadataKind } from '../../metadata/models/ClassElementMetadataKind';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { ManagedClassElementMetadata } from '../../metadata/models/ManagedClassElementMetadata';
import { ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata';
import { ResolvedValueElementMetadataKind } from '../../metadata/models/ResolvedValueElementMetadataKind';
import { ResolvedValueMetadata } from '../../metadata/models/ResolvedValueMetadata';
import { getServiceFromMaybeLazyServiceIdentifier } from '../calculations/getServiceFromMaybeLazyServiceIdentifier';
import { isInstanceBindingNode } from '../calculations/isInstanceBindingNode';
import { tryBuildGetPlanOptionsFromManagedClassElementMetadata } from '../calculations/tryBuildGetPlanOptionsFromManagedClassElementMetadata';
import { tryBuildGetPlanOptionsFromResolvedValueElementMetadata } from '../calculations/tryBuildGetPlanOptionsFromResolvedValueElementMetadata';
import { GetPlanOptions } from '../models/GetPlanOptions';
import { InstanceBindingNode } from '../models/InstanceBindingNode';
import { LazyPlanServiceNode } from '../models/LazyPlanServiceNode';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanResult } from '../models/PlanResult';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { ResolvedValueBindingNode } from '../models/ResolvedValueBindingNode';
import { SubplanParams } from '../models/SubplanParams';
import { cacheNonRootPlanServiceNode } from './cacheNonRootPlanServiceNode';

class LazyManagedClassMetadataPlanServiceNode extends LazyPlanServiceNode {
  readonly #params: SubplanParams;
  readonly #buildLazyPlanServiceNodeNodeFromClassElementMetadata: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ManagedClassElementMetadata,
  ) => PlanServiceNode;
  readonly #bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>;
  readonly #elementMetadata: ManagedClassElementMetadata;

  constructor(
    params: SubplanParams,
    buildLazyPlanServiceNodeNodeFromClassElementMetadata: (
      params: SubplanParams,
      bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
      elementMetadata: ManagedClassElementMetadata,
    ) => PlanServiceNode,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ManagedClassElementMetadata,
    serviceNode: PlanServiceNode | undefined,
  ) {
    super(
      serviceNode,
      getServiceFromMaybeLazyServiceIdentifier(elementMetadata.value),
    );

    this.#buildLazyPlanServiceNodeNodeFromClassElementMetadata =
      buildLazyPlanServiceNodeNodeFromClassElementMetadata;
    this.#params = params;
    this.#bindingConstraintsList = bindingConstraintsList;
    this.#elementMetadata = elementMetadata;
  }

  protected override _buildPlanServiceNode(): PlanServiceNode {
    return this.#buildLazyPlanServiceNodeNodeFromClassElementMetadata(
      this.#params,
      this.#bindingConstraintsList,
      this.#elementMetadata,
    );
  }
}

class LazyResolvedValueMetadataPlanServiceNode extends LazyPlanServiceNode {
  readonly #params: SubplanParams;
  readonly #buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadata: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ResolvedValueElementMetadata,
  ) => PlanServiceNode;
  readonly #bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>;
  readonly #resolvedValueElementMetadata: ResolvedValueElementMetadata;

  constructor(
    params: SubplanParams,
    buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadata: (
      params: SubplanParams,
      bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
      elementMetadata: ResolvedValueElementMetadata,
    ) => PlanServiceNode,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    resolvedValueElementMetadata: ResolvedValueElementMetadata,
    serviceNode: PlanServiceNode | undefined,
  ) {
    super(
      serviceNode,
      getServiceFromMaybeLazyServiceIdentifier(
        resolvedValueElementMetadata.value,
      ),
    );

    this.#params = params;
    this.#buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadata =
      buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadata;
    this.#bindingConstraintsList = bindingConstraintsList;
    this.#resolvedValueElementMetadata = resolvedValueElementMetadata;
  }

  protected override _buildPlanServiceNode(): PlanServiceNode {
    return this.#buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadata(
      this.#params,
      this.#bindingConstraintsList,
      this.#resolvedValueElementMetadata,
    );
  }
}

export function currySubplan(
  buildLazyPlanServiceNodeNodeFromClassElementMetadata: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ManagedClassElementMetadata,
  ) => PlanServiceNode,
  buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadata: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ResolvedValueElementMetadata,
  ) => PlanServiceNode,
  buildPlanServiceNodeFromClassElementMetadata: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ManagedClassElementMetadata,
  ) => PlanServiceNode | undefined,
  buildPlanServiceNodeFromResolvedValueElementMetadata: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ResolvedValueElementMetadata,
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
    buildLazyPlanServiceNodeNodeFromClassElementMetadata,
    buildPlanServiceNodeFromClassElementMetadata,
  );

  const subplanResolvedValueBindingNode: (
    params: SubplanParams,
    node: ResolvedValueBindingNode,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
  ) => PlanBindingNode = currySubplanResolvedValueBindingNode(
    buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadata,
    buildPlanServiceNodeFromResolvedValueElementMetadata,
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
  buildLazyPlanServiceNodeNodeFromClassElementMetadata: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ManagedClassElementMetadata,
  ) => PlanServiceNode,
  buildPlanServiceNodeFromClassElementMetadata: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ManagedClassElementMetadata,
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
      buildLazyPlanServiceNodeNodeFromClassElementMetadata,
      buildPlanServiceNodeFromClassElementMetadata,
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
  buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadata: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ResolvedValueElementMetadata,
  ) => PlanServiceNode,
  buildPlanServiceNodeFromResolvedValueElementMetadata: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ResolvedValueElementMetadata,
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
      buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadata,
      buildPlanServiceNodeFromResolvedValueElementMetadata,
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
  buildLazyPlanServiceNodeNodeFromClassElementMetadata: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ManagedClassElementMetadata,
  ) => PlanServiceNode,
  buildPlanServiceNodeFromClassElementMetadata: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ManagedClassElementMetadata,
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

    const getPlanOptions: GetPlanOptions | undefined =
      tryBuildGetPlanOptionsFromManagedClassElementMetadata(elementMetadata);

    if (getPlanOptions !== undefined) {
      const planResult: PlanResult | undefined =
        params.operations.getPlan(getPlanOptions);

      if (planResult !== undefined && planResult.tree.root.isContextFree) {
        return planResult.tree.root;
      }
    }

    const serviceNode: PlanServiceNode | undefined =
      buildPlanServiceNodeFromClassElementMetadata(
        params,
        bindingConstraintsList,
        elementMetadata,
      );

    const lazyPlanServiceNode: LazyPlanServiceNode =
      new LazyManagedClassMetadataPlanServiceNode(
        params,
        buildLazyPlanServiceNodeNodeFromClassElementMetadata,
        bindingConstraintsList,
        elementMetadata,
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
    elementMetadata: ResolvedValueElementMetadata,
  ) => PlanServiceNode,
  buildPlanServiceNodeFromResolvedValueElementMetadata: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ResolvedValueElementMetadata,
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

    const serviceNode: PlanServiceNode | undefined =
      buildPlanServiceNodeFromResolvedValueElementMetadata(
        params,
        bindingConstraintsList,
        elementMetadata,
      );

    const lazyPlanServiceNode: LazyPlanServiceNode =
      new LazyResolvedValueMetadataPlanServiceNode(
        params,
        buildLazyPlanServiceNodeNodeFromResolvedValueElementMetadata,
        bindingConstraintsList,
        elementMetadata,
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
