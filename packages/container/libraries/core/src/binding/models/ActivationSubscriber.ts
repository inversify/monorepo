import { type ServiceIdentifier } from '@inversifyjs/common';

import { type BindingActivation } from './BindingActivation.js';

export interface ActivationSubscriber {
  onActivationAdded(
    serviceIdentifier: ServiceIdentifier,
    activation: BindingActivation,
  ): void;
}
