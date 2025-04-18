import {
  ActivationsService,
  BindingService,
  DeactivationsService,
  PlanResultCacheService,
} from '@inversifyjs/core';

export interface PluginContext {
  readonly activationService: ActivationsService;
  readonly bindingService: BindingService;
  readonly deactivationService: DeactivationsService;
  readonly planResultCacheService: PlanResultCacheService;
}
