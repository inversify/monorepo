import { CacheBindingInvalidation } from '../models/CacheBindingInvalidation';
import { PlanParamsOperationsManager } from './PlanParamsOperationsManager';
import { ServiceReferenceManager } from './ServiceReferenceManager';

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
