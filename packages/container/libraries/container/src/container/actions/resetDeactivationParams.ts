import { DeactivationParams } from '@inversifyjs/core';

import { ServiceReferenceManager } from '../services/ServiceReferenceManager';

export function resetDeactivationParams(
  serviceReferenceManager: ServiceReferenceManager,
  deactivationParams: DeactivationParams,
): void {
  deactivationParams.getBindings =
    serviceReferenceManager.bindingService.get.bind(
      serviceReferenceManager.bindingService,
    );
  deactivationParams.getBindingsFromModule =
    serviceReferenceManager.bindingService.getByModuleId.bind(
      serviceReferenceManager.bindingService,
    );
  deactivationParams.getDeactivations =
    serviceReferenceManager.deactivationService.get.bind(
      serviceReferenceManager.deactivationService,
    );
}
