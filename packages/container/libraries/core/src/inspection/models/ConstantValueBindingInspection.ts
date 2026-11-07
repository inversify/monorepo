import { type bindingScopeValues } from '../../binding/models/BindingScope.js';
import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type ScopedBindingInspection } from './ScopedBindingInspection.js';

export type ConstantValueBindingInspection = ScopedBindingInspection<
  typeof bindingTypeValues.ConstantValue,
  typeof bindingScopeValues.Singleton
>;
