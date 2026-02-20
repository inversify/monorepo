import { type Binding } from '../../binding/models/Binding.js';
import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import { type SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata.js';
import { type BasePlanParams } from '../models/BasePlanParams.js';
import { type BindingNodeParent } from '../models/BindingNodeParent.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type SubplanParams } from '../models/SubplanParams.js';
import { curryBuildPlanServiceNodeFromResolvedValueElementMetadata } from './curryBuildPlanServiceNodeFromResolvedValueElementMetadata.js';

export function curryLazyBuildPlanServiceNodeFromResolvedValueElementMetadata(
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
) => PlanServiceNode | undefined {
  const buildPlanServiceNodeFromResolvedValueElementMetadata: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ResolvedValueElementMetadata,
  ) => PlanServiceNode | undefined =
    curryBuildPlanServiceNodeFromResolvedValueElementMetadata(
      buildServiceNodeBindings,
    );

  return (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ResolvedValueElementMetadata,
  ): PlanServiceNode | undefined => {
    try {
      return buildPlanServiceNodeFromResolvedValueElementMetadata(
        params,
        bindingConstraintsList,
        elementMetadata,
      );
    } catch (error: unknown) {
      if (
        InversifyCoreError.isErrorOfKind(error, InversifyCoreErrorKind.planning)
      ) {
        return undefined;
      }

      throw error;
    }
  };
}
