import { type Binding } from '../../binding/models/Binding.js';
import { type InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation.js';
import { type SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList.js';
import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type ManagedClassElementMetadata } from '../../metadata/models/ManagedClassElementMetadata.js';
import { type BasePlanParams } from '../models/BasePlanParams.js';
import { type BindingNodeParent } from '../models/BindingNodeParent.js';
import { type PlanBindingNode } from '../models/PlanBindingNode.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { type SubplanParams } from '../models/SubplanParams.js';
import { curryBuildPlanServiceNodeFromClassElementMetadata } from './curryBuildPlanServiceNodeFromClassElementMetadata.js';

export function curryLazyBuildPlanServiceNodeFromClassElementMetadata(
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
  elementMetadata: ManagedClassElementMetadata,
) => PlanServiceNode | undefined {
  const buildPlanServiceNodeFromClassElementMetadata: (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ManagedClassElementMetadata,
  ) => PlanServiceNode = curryBuildPlanServiceNodeFromClassElementMetadata(
    buildServiceNodeBindings,
  );

  return (
    params: SubplanParams,
    bindingConstraintsList: SingleImmutableLinkedList<InternalBindingConstraints>,
    elementMetadata: ManagedClassElementMetadata,
  ): PlanServiceNode | undefined => {
    try {
      return buildPlanServiceNodeFromClassElementMetadata(
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
