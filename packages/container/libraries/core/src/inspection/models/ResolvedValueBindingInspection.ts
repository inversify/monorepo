import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type PlanServiceInspection } from './PlanServiceInspection.js';
import { type ScopedBindingInspection } from './ScopedBindingInspection.js';

export interface ResolvedValueBindingInspection extends ScopedBindingInspection<
  typeof bindingTypeValues.ResolvedValue
> {
  readonly arguments: readonly PlanServiceInspection[];
}
