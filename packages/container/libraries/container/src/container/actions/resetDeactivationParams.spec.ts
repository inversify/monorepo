import { beforeAll, describe, expect, it, vitest } from 'vitest';

import { ServiceIdentifier } from '@inversifyjs/common';
import {
  Binding,
  BindingDeactivation,
  BindingService,
  DeactivationParams,
  DeactivationsService,
} from '@inversifyjs/core';

import { ServiceReferenceManager } from '../services/ServiceReferenceManager';
import { resetDeactivationParams } from './resetDeactivationParams';

describe(resetDeactivationParams, () => {
  let serviceReferenceManager: ServiceReferenceManager;

  beforeAll(() => {
    serviceReferenceManager = {
      bindingService: {
        get: vitest.fn(),
        getByModuleId: vitest.fn(),
      } as Partial<BindingService> as BindingService,
      deactivationService: {
        get: vitest.fn(),
      } as Partial<DeactivationsService> as DeactivationsService,
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
