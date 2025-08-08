import { DeactivationParams } from '@inversifyjs/core';

import { resetDeactivationParams } from '../actions/resetDeactivationParams';
import { buildDeactivationParams } from '../calculations/buildDeactivationParams';
import { ServiceReferenceManager } from './ServiceReferenceManager';

export class DeactivationParamsManager {
  public readonly deactivationParams: DeactivationParams;

  constructor(serviceReferenceManager: ServiceReferenceManager) {
    this.deactivationParams = buildDeactivationParams(serviceReferenceManager);

    serviceReferenceManager.onReset((): void => {
      resetDeactivationParams(serviceReferenceManager, this.deactivationParams);
    });
  }
}
