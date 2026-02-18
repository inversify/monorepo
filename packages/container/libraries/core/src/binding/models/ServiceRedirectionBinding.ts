import { type ServiceIdentifier } from '@inversifyjs/common';

import { type BaseBinding } from './BaseBinding.js';
import { type bindingTypeValues } from './BindingType.js';

export interface ServiceRedirectionBinding<TActivated> extends BaseBinding<
  typeof bindingTypeValues.ServiceRedirection,
  TActivated
> {
  targetServiceIdentifier: ServiceIdentifier;
}
