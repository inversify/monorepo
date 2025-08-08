import { Binding } from '../../binding/models/Binding';
import { PlanParamsOperations } from './PlanParamsOperations';
import { PlanResultCacheServiceInvalidationKind } from './PlanResultCacheServiceInvalidationKind';

export interface PlanResultCacheServiceInvalidation {
  binding: Binding<unknown>;
  kind: PlanResultCacheServiceInvalidationKind;
  operations: PlanParamsOperations;
}
