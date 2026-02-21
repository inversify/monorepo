import {
  type ActivationsService,
  type BindingService,
  type DeactivationsService,
  type PlanResultCacheService,
} from '@inversifyjs/core';

/**
 * Manages references to core services used throughout the Container
 * This class allows for proper synchronization of services during snapshot/restore operations
 */
export class ServiceReferenceManager {
  public activationService: ActivationsService;
  public bindingService: BindingService;
  public deactivationService: DeactivationsService;
  public readonly planResultCacheService: PlanResultCacheService;

  readonly #onResetComputedPropertiesListeners: (() => void)[];

  constructor(
    activationService: ActivationsService,
    bindingService: BindingService,
    deactivationService: DeactivationsService,
    planResultCacheService: PlanResultCacheService,
  ) {
    this.activationService = activationService;
    this.bindingService = bindingService;
    this.deactivationService = deactivationService;
    this.planResultCacheService = planResultCacheService;

    this.#onResetComputedPropertiesListeners = [];
  }

  public reset(
    activationService: ActivationsService,
    bindingService: BindingService,
    deactivationService: DeactivationsService,
  ): void {
    this.activationService = activationService;
    this.bindingService = bindingService;
    this.deactivationService = deactivationService;

    this.planResultCacheService.clearCache();

    for (const listener of this.#onResetComputedPropertiesListeners) {
      listener();
    }
  }

  public onReset(listener: () => void): void {
    this.#onResetComputedPropertiesListeners.push(listener);
  }
}
