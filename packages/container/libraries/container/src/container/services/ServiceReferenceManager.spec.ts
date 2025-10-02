import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

import {
  ActivationsService,
  BindingService,
  DeactivationsService,
  PlanResultCacheService,
} from '@inversifyjs/core';

import { ServiceReferenceManager } from './ServiceReferenceManager';

describe(ServiceReferenceManager, () => {
  let activationServiceMock: Mocked<ActivationsService>;
  let bindingServiceMock: Mocked<BindingService>;
  let deactivationServiceMock: Mocked<DeactivationsService>;
  let planResultCacheServiceMock: Mocked<PlanResultCacheService>;

  beforeAll(() => {
    activationServiceMock = {} as Partial<
      Mocked<ActivationsService>
    > as Mocked<ActivationsService>;

    bindingServiceMock = {} as Partial<
      Mocked<BindingService>
    > as Mocked<BindingService>;

    deactivationServiceMock = {} as Partial<
      Mocked<DeactivationsService>
    > as Mocked<DeactivationsService>;

    planResultCacheServiceMock = {
      clearCache: vitest.fn(),
    } as Partial<
      Mocked<PlanResultCacheService>
    > as Mocked<PlanResultCacheService>;
  });

  describe('resetComputedProperties', () => {
    let newActivationServiceMock: Mocked<ActivationsService>;
    let newBindingServiceMock: Mocked<BindingService>;
    let newDeactivationServiceMock: Mocked<DeactivationsService>;

    beforeAll(() => {
      newActivationServiceMock = {} as Partial<
        Mocked<ActivationsService>
      > as Mocked<ActivationsService>;

      newBindingServiceMock = {} as Partial<
        Mocked<BindingService>
      > as Mocked<BindingService>;

      newDeactivationServiceMock = {} as Partial<
        Mocked<DeactivationsService>
      > as Mocked<DeactivationsService>;
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
