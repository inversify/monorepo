import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

import {
  type ActivationsService,
  type BindingService,
  type DeactivationsService,
  type PlanResultCacheService,
} from '@inversifyjs/core';

import { ServiceReferenceManager } from './ServiceReferenceManager.js';

describe(ServiceReferenceManager, () => {
  let activationServiceMock: Mocked<ActivationsService>;
  let bindingServiceMock: Mocked<BindingService>;
  let deactivationServiceMock: Mocked<DeactivationsService>;
  let planResultCacheServiceMock: Mocked<PlanResultCacheService>;

  beforeAll(() => {
    activationServiceMock = {} as Mocked<ActivationsService>;

    bindingServiceMock = {} as Mocked<BindingService>;

    deactivationServiceMock = {} as Mocked<DeactivationsService>;

    planResultCacheServiceMock = {
      clearCache: vitest.fn() as unknown,
    } as Mocked<PlanResultCacheService>;
  });

  describe('resetComputedProperties', () => {
    let newActivationServiceMock: Mocked<ActivationsService>;
    let newBindingServiceMock: Mocked<BindingService>;
    let newDeactivationServiceMock: Mocked<DeactivationsService>;

    beforeAll(() => {
      newActivationServiceMock = {} as Mocked<ActivationsService>;

      newBindingServiceMock = {} as Mocked<BindingService>;

      newDeactivationServiceMock = {} as Mocked<DeactivationsService>;
    });

    describe('when called', () => {
      let serviceReferenceManager: ServiceReferenceManager;

      let result: unknown;

      beforeAll(() => {
        serviceReferenceManager = new ServiceReferenceManager(
          activationServiceMock,
          bindingServiceMock,
          deactivationServiceMock,
          planResultCacheServiceMock,
        );

        result = serviceReferenceManager.reset(
          newActivationServiceMock,
          newBindingServiceMock,
          newDeactivationServiceMock,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set activationService', () => {
        expect(serviceReferenceManager.activationService).toBe(
          newActivationServiceMock,
        );
      });

      it('should set bindingService', () => {
        expect(serviceReferenceManager.bindingService).toBe(
          newBindingServiceMock,
        );
      });

      it('should set deactivationService', () => {
        expect(serviceReferenceManager.deactivationService).toBe(
          newDeactivationServiceMock,
        );
      });

      it('should set planResultCacheService', () => {
        expect(serviceReferenceManager.planResultCacheService).toBe(
          planResultCacheServiceMock,
        );
      });

      it('should call planResultCacheService.clearCache()', () => {
        expect(planResultCacheServiceMock.clearCache).toHaveBeenCalledTimes(1);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called serviceReferenceManager.onResetComputedProperties() and then called', () => {
      let serviceReferenceManager: ServiceReferenceManager;

      let onResetComputedPropertiesListenerMock: () => void;

      let result: unknown;

      beforeAll(() => {
        serviceReferenceManager = new ServiceReferenceManager(
          activationServiceMock,
          bindingServiceMock,
          deactivationServiceMock,
          planResultCacheServiceMock,
        );

        onResetComputedPropertiesListenerMock = vitest.fn();

        serviceReferenceManager.onReset(onResetComputedPropertiesListenerMock);

        result = serviceReferenceManager.reset(
          newActivationServiceMock,
          newBindingServiceMock,
          newDeactivationServiceMock,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set activationService', () => {
        expect(serviceReferenceManager.activationService).toBe(
          newActivationServiceMock,
        );
      });

      it('should set bindingService', () => {
        expect(serviceReferenceManager.bindingService).toBe(
          newBindingServiceMock,
        );
      });

      it('should set deactivationService', () => {
        expect(serviceReferenceManager.deactivationService).toBe(
          newDeactivationServiceMock,
        );
      });

      it('should call planResultCacheService.clearCache()', () => {
        expect(planResultCacheServiceMock.clearCache).toHaveBeenCalledTimes(1);
      });

      it('should call onResetComputedPropertiesListenerMock()', () => {
        expect(
          onResetComputedPropertiesListenerMock,
        ).toHaveBeenCalledExactlyOnceWith();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
