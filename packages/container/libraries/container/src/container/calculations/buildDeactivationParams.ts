import { type DeactivationParams, getClassMetadata } from '@inversifyjs/core';

import { type ServiceReferenceManager } from '../services/ServiceReferenceManager.js';

export function buildDeactivationParams(
  serviceReferenceManager: ServiceReferenceManager,
): DeactivationParams {
  return {
    getBindings: serviceReferenceManager.bindingService.get.bind(
      serviceReferenceManager.bindingService,
    ),
    getBindingsFromModule:
      serviceReferenceManager.bindingService.getByModuleId.bind(
        serviceReferenceManager.bindingService,
      ),
    getClassMetadata,
    getDeactivations: serviceReferenceManager.deactivationService.get.bind(
      serviceReferenceManager.deactivationService,
    ),
  };
}
