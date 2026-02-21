import { type CacheBindingInvalidation } from '../models/CacheBindingInvalidation.js';
import { type PlanParamsOperationsManager } from './PlanParamsOperationsManager.js';
import { type ServiceReferenceManager } from './ServiceReferenceManager.js';

export class PlanResultCacheManager {
  readonly #planParamsOperationsManager: PlanParamsOperationsManager;
  readonly #serviceReferenceManager: ServiceReferenceManager;

  constructor(
    planParamsOperationsManager: PlanParamsOperationsManager,
    serviceReferenceManager: ServiceReferenceManager,
  ) {
    this.#planParamsOperationsManager = planParamsOperationsManager;
    this.#serviceReferenceManager = serviceReferenceManager;
  }

  public invalidateService(invalidation: CacheBindingInvalidation): void {
    this.#serviceReferenceManager.planResultCacheService.invalidateServiceBinding(
      {
        ...invalidation,
        operations: this.#planParamsOperationsManager.planParamsOperations,
      },
    );
  }
}
