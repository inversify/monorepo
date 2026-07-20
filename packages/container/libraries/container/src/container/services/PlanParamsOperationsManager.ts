import { type ServiceIdentifier } from '@inversifyjs/common';
import {
  type Binding,
  type BindingActivation,
  CacheBindingInvalidationKind,
  getClassMetadata,
  type PlanParamsOperations,
} from '@inversifyjs/core';

import { type ActivationSubscriber } from '../../../../core/lib/binding/models/ActivationSubscriber.js';
import { type ServiceReferenceManager } from './ServiceReferenceManager.js';

export class PlanParamsOperationsManager {
  public readonly planParamsOperations: PlanParamsOperations;
  readonly #serviceReferenceManager: ServiceReferenceManager;

  constructor(serviceReferenceManager: ServiceReferenceManager) {
    this.#serviceReferenceManager = serviceReferenceManager;

    this.planParamsOperations = {
      getActivations: this.#getActivations.bind(this),
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
      subscribeActivationAddedOnce:
        this.#subscribeActivationAddedOnce.bind(this),
    };

    this.#serviceReferenceManager.onReset(() => {
      this.#resetComputedProperties();
    });
  }

  #getActivations<TActivated>(
    serviceIdentifier: ServiceIdentifier<TActivated>,
  ): Iterable<BindingActivation<TActivated>> | undefined {
    return this.#serviceReferenceManager.activationService.get(
      serviceIdentifier,
    ) as Iterable<BindingActivation<TActivated>> | undefined;
  }

  #subscribeActivationAddedOnce(
    serviceIdentifier: ServiceIdentifier,
    subscriber: ActivationSubscriber,
  ): void {
    this.#serviceReferenceManager.activationService.subscribeOnce(
      serviceIdentifier,
      subscriber,
    );
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
