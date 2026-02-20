import { type ServiceIdentifier } from '@inversifyjs/common';

import { type BindingConstraints } from './BindingConstraints.js';
import { type BindingType } from './BindingType.js';

export interface BaseBinding<TType extends BindingType, TActivated> {
  readonly id: number;
  readonly moduleId: number | undefined;
  readonly serviceIdentifier: ServiceIdentifier<TActivated>;
  readonly type: TType;

  readonly isSatisfiedBy: (constraints: BindingConstraints) => boolean;
}
