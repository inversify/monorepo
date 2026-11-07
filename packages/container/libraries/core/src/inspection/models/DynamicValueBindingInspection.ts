import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type ScopedBindingInspection } from './ScopedBindingInspection.js';

export type DynamicValueBindingInspection = ScopedBindingInspection<
  typeof bindingTypeValues.DynamicValue
>;
