import { type ServiceIdentifier } from '@inversifyjs/common';

import { type bindingTypeValues } from '../../binding/models/BindingType.js';
import { type BaseBindingInspection } from './BaseBindingInspection.js';
import { type PlanServiceInspection } from './PlanServiceInspection.js';

export interface ServiceRedirectionBindingInspection extends BaseBindingInspection<
  typeof bindingTypeValues.ServiceRedirection
> {
  readonly redirection: PlanServiceInspection;
  readonly targetServiceIdentifier: ServiceIdentifier;
}
