import { beforeAll, describe, expect, it, vitest } from 'vitest';

import { type ServiceIdentifier } from '@inversifyjs/common';
import {
  type Binding,
  type BindingDeactivation,
  type BindingService,
  type DeactivationParams,
  type DeactivationsService,
} from '@inversifyjs/core';

import { type ServiceReferenceManager } from '../services/ServiceReferenceManager.js';
import { resetDeactivationParams } from './resetDeactivationParams.js';

describe(resetDeactivationParams, () => {
  let serviceReferenceManager: ServiceReferenceManager;

  beforeAll(() => {
    serviceReferenceManager = {
      bindingService: {
        get: vitest.fn(),
        getByModuleId: vitest.fn(),
      } as Partial<BindingService>,
      deactivationService: {
        get: vitest.fn(),
      } as Partial<DeactivationsService>,
    } as Partial<ServiceReferenceManager> as ServiceReferenceManager;
  });

  describe('when called', () => {
    let deactivationParamsFixture: DeactivationParams;

    let result: unknown;

    beforeAll(() => {
      deactivationParamsFixture = {
        getBindings: Symbol() as unknown as <TInstance>(
          serviceIdentifier: ServiceIdentifier<TInstance>,
        ) => Iterable<Binding<TInstance>> | undefined,
        getBindingsFromModule: Symbol() as unknown as <TInstance>(
          moduleId: number,
        ) => Iterable<Binding<TInstance>> | undefined,
        getDeactivations: Symbol() as unknown as <TActivated>(
          serviceIdentifier: ServiceIdentifier<TActivated>,
        ) => Iterable<BindingDeactivation<TActivated>> | undefined,
      } as Partial<DeactivationParams> as DeactivationParams;

      result = resetDeactivationParams(
        serviceReferenceManager,
        deactivationParamsFixture,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });

    it('should reset deactivationParams property', () => {
      expect(deactivationParamsFixture.getBindings).toBeInstanceOf(Function);
      expect(deactivationParamsFixture.getBindingsFromModule).toBeInstanceOf(
        Function,
      );
      expect(deactivationParamsFixture.getDeactivations).toBeInstanceOf(
        Function,
      );
    });
  });
});
