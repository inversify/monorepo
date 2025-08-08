import { Binding } from '../../binding/models/Binding';
import { CacheBindingInvalidationKind } from './CacheBindingInvalidationKind';
import { PlanParamsOperations } from './PlanParamsOperations';

export interface CacheBindingInvalidation {
  binding: Binding<unknown>;
  kind: CacheBindingInvalidationKind;
  operations: PlanParamsOperations;
}
