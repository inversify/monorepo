import { type Newable } from '@inversifyjs/common';

import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type PlanServiceInspection } from './PlanServiceInspection.js';
import { type ScopedBindingInspection } from './ScopedBindingInspection.js';

export interface InstanceBindingInspection extends ScopedBindingInspection<
  typeof bindingTypeValues.Instance
> {
  readonly constructorArguments: readonly (PlanServiceInspection | undefined)[];
  readonly implementationType: Newable;
  readonly properties: ReadonlyMap<string | symbol, PlanServiceInspection>;
}
