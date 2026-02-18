import { type Either } from '@inversifyjs/common';

import { type Resolved } from '../../resolution/models/Resolved.js';
import { type BaseBinding } from './BaseBinding.js';
import { type BindingActivation } from './BindingActivation.js';
import { type BindingDeactivation } from './BindingDeactivation.js';
import { type BindingScope } from './BindingScope.js';
import { type BindingType } from './BindingType.js';

export interface ScopedBinding<
  TType extends BindingType,
  TScope extends BindingScope,
  TActivated,
> extends BaseBinding<TType, TActivated> {
  cache: Either<undefined, Resolved<TActivated>>;
  readonly onActivation: BindingActivation<TActivated> | undefined;
  readonly onDeactivation: BindingDeactivation<TActivated> | undefined;
  readonly scope: TScope;
}
