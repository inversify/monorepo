import { Either } from '@inversifyjs/common';

import { SyncResolved } from '../../resolution/models/Resolved';
import { BaseBinding } from './BaseBinding';
import { BindingActivation } from './BindingActivation';
import { BindingDeactivation } from './BindingDeactivation';
import { BindingScope } from './BindingScope';
import { BindingType } from './BindingType';

export interface ScopedBinding<
  TType extends BindingType,
  TScope extends BindingScope,
  TActivated,
> extends BaseBinding<TType, TActivated> {
  cache: Either<undefined, SyncResolved<TActivated>>;
  readonly onActivation: BindingActivation<TActivated> | undefined;
  readonly onDeactivation: BindingDeactivation<TActivated> | undefined;
  readonly scope: TScope;
}
