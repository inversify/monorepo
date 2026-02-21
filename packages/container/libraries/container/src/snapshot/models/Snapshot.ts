import {
  type ActivationsService,
  type BindingService,
  type DeactivationsService,
} from '@inversifyjs/core';

export interface Snapshot {
  activationService: ActivationsService;
  bindingService: BindingService;
  deactivationService: DeactivationsService;
}
