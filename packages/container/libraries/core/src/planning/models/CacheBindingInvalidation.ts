import { type Binding } from '../../binding/models/Binding.js';
import { type CacheBindingInvalidationKind } from './CacheBindingInvalidationKind.js';
import { type PlanParamsOperations } from './PlanParamsOperations.js';

export interface CacheBindingInvalidation {
  binding: Binding<unknown>;
  kind: CacheBindingInvalidationKind;
  operations: PlanParamsOperations;
}
