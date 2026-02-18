import { type Resolved } from '../../resolution/models/Resolved.js';
import { type bindingScopeValues } from './BindingScope.js';
import { type bindingTypeValues } from './BindingType.js';
import { type ScopedBinding } from './ScopedBinding.js';

export interface ConstantValueBinding<TActivated> extends ScopedBinding<
  typeof bindingTypeValues.ConstantValue,
  typeof bindingScopeValues.Singleton,
  TActivated
> {
  readonly value: Resolved<TActivated>;
}
