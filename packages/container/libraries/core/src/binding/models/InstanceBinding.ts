import { Newable } from '@inversifyjs/common';

import { BindingScope } from './BindingScope';
import { bindingTypeValues } from './BindingType';
import { ScopedBinding } from './ScopedBinding';

export interface InstanceBinding<TActivated> extends ScopedBinding<
  typeof bindingTypeValues.Instance,
  BindingScope,
  TActivated
> {
  readonly implementationType: Newable<TActivated>;
}
