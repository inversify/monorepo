import {
  Binding,
  CacheBindingInvalidationKind,
  getClassMetadata,
  PlanParamsOperations,
} from '@inversifyjs/core';

import { ServiceReferenceManager } from './ServiceReferenceManager';

export class PlanParamsOperationsManager {
  public readonly planParamsOperations: PlanParamsOperations;
  readonly #serviceReferenceManager: ServiceReferenceManager;

  constructor(serviceReferenceManager: ServiceReferenceManager) {
    this.#serviceReferenceManager = serviceReferenceManager;

    this.planParamsOperations = {
      getBindings: this.#serviceReferenceManager.bindingService.get.bind(
        this.#serviceReferenceManager.bindingService,
      ),
      getBindingsChained:
        this.#serviceReferenceManager.bindingService.getChained.bind(
          this.#serviceReferenceManager.bindingService,
        ),
      getClassMetadata,
      getPlan: this.#serviceReferenceManager.planResultCacheService.get.bind(
        this.#serviceReferenceManager.planResultCacheService,
      ),
      setBinding: this.#setBinding.bind(this),
      setNonCachedServiceNode:
        this.#serviceReferenceManager.planResultCacheService.setNonCachedServiceNode.bind(
          this.#serviceReferenceManager.planResultCacheService,
        ),
      setPlan: this.#serviceReferenceManager.planResultCacheService.set.bind(
        this.#serviceReferenceManager.planResultCacheService,
      ),
    };

    this.#serviceReferenceManager.onReset(() => {
      this.#resetComputedProperties();
    });
  }

  #resetComputedProperties(): void {
    this.planParamsOperations.getBindings =
      this.#serviceReferenceManager.bindingService.get.bind(
        this.#serviceReferenceManager.bindingService,
      );
    this.planParamsOperations.getBindingsChained =
      this.#serviceReferenceManager.bindingService.getChained.bind(
        this.#serviceReferenceManager.bindingService,
      );
    this.planParamsOperations.setBinding = this.#setBinding.bind(this);
  }

  #setBinding(binding: Binding): void {
    this.#serviceReferenceManager.bindingService.set(binding);
    this.#serviceReferenceManager.planResultCacheService.invalidateServiceBinding(
      {
        binding: binding as Binding<unknown>,
        kind: CacheBindingInvalidationKind.bindingAdded,
        operations: this.planParamsOperations,
      },
    );
  }
}
