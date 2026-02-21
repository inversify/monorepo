import { type DeactivationParams } from '@inversifyjs/core';

import { resetDeactivationParams } from '../actions/resetDeactivationParams.js';
import { buildDeactivationParams } from '../calculations/buildDeactivationParams.js';
import { type ServiceReferenceManager } from './ServiceReferenceManager.js';

export class DeactivationParamsManager {
  public readonly deactivationParams: DeactivationParams;

  constructor(serviceReferenceManager: ServiceReferenceManager) {
    this.deactivationParams = buildDeactivationParams(serviceReferenceManager);

    serviceReferenceManager.onReset((): void => {
      resetDeactivationParams(serviceReferenceManager, this.deactivationParams);
    });
  }
}
