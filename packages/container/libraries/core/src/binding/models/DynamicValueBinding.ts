import { type BindingScope } from './BindingScope.js';
import { type bindingTypeValues } from './BindingType.js';
import { type DynamicValueBuilder } from './DynamicValueBuilder.js';
import { type ScopedBinding } from './ScopedBinding.js';

export interface DynamicValueBinding<TActivated> extends ScopedBinding<
  typeof bindingTypeValues.DynamicValue,
  BindingScope,
  TActivated
> {
  readonly value: DynamicValueBuilder<TActivated>;
}
