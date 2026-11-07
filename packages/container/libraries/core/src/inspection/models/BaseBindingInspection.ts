import { type ServiceIdentifier } from '@inversifyjs/common';

import { type BindingType } from '../../binding/models/BindingType.js';

export interface BaseBindingInspection<TType extends BindingType> {
  readonly id: number;
  readonly moduleId: number | undefined;
  readonly serviceIdentifier: ServiceIdentifier;
  readonly type: TType;
}
