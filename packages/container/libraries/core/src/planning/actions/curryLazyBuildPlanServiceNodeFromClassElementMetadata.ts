import { Binding } from '../../binding/models/Binding';
import { InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList';
import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { ManagedClassElementMetadata } from '../../metadata/models/ManagedClassElementMetadata';
import { BasePlanParams } from '../models/BasePlanParams';
import { BindingNodeParent } from '../models/BindingNodeParent';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { SubplanParams } from '../models/SubplanParams';
import { curryBuildPlanServiceNodeFromClassElementMetadata } from './curryBuildPlanServiceNodeFromClassElementMetadata';

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
