import { type bindingScopeValues } from '../../binding/models/BindingScope.js';
import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type ScopedBindingInspection } from './ScopedBindingInspection.js';

export type FactoryBindingInspection = ScopedBindingInspection<
  typeof bindingTypeValues.Factory,
  typeof bindingScopeValues.Singleton
>;
