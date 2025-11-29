import { Resolved } from '../../resolution/models/Resolved';
import { bindingScopeValues } from './BindingScope';
import { bindingTypeValues } from './BindingType';
import { ScopedBinding } from './ScopedBinding';

export interface ConstantValueBinding<TActivated> extends ScopedBinding<
  typeof bindingTypeValues.ConstantValue,
  typeof bindingScopeValues.Singleton,
  TActivated
> {
  readonly value: Resolved<TActivated>;
}
