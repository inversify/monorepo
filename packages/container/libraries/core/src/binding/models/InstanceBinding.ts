import { type Newable } from '@inversifyjs/common';

import { type BindingScope } from './BindingScope.js';
import { type bindingTypeValues } from './BindingType.js';
import { type ScopedBinding } from './ScopedBinding.js';

export interface InstanceBinding<TActivated> extends ScopedBinding<
  typeof bindingTypeValues.Instance,
  BindingScope,
  TActivated
> {
  readonly implementationType: Newable<TActivated>;
}
