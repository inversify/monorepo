import { ServiceIdentifier } from '@inversifyjs/common';

import { BaseBinding } from './BaseBinding';
import { bindingTypeValues } from './BindingType';

export interface ServiceRedirectionBinding<TActivated> extends BaseBinding<
  typeof bindingTypeValues.ServiceRedirection,
  TActivated
> {
  targetServiceIdentifier: ServiceIdentifier;
}
