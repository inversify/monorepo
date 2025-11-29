import { BindingScope } from './BindingScope';
import { bindingTypeValues } from './BindingType';
import { DynamicValueBuilder } from './DynamicValueBuilder';
import { ScopedBinding } from './ScopedBinding';

export interface DynamicValueBinding<TActivated> extends ScopedBinding<
  typeof bindingTypeValues.DynamicValue,
  BindingScope,
  TActivated
> {
  readonly value: DynamicValueBuilder<TActivated>;
}
