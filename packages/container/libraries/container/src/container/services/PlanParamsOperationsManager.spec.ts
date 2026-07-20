import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

import { type ServiceIdentifier } from '@inversifyjs/common';
import {
  type ActivationsService,
  type Binding,
  type BindingActivation,
  type BindingService,
  CacheBindingInvalidationKind,
  getClassMetadata,
  type PlanResultCacheService,
} from '@inversifyjs/core';

import { PlanParamsOperationsManager } from './PlanParamsOperationsManager.js';
import { type ServiceReferenceManager } from './ServiceReferenceManager.js';

describe(PlanParamsOperationsManager, () => {
  let activationServiceMock: Mocked<ActivationsService>;
  let bindingServiceMock: Mocked<BindingService>;
  let planResultCacheServiceMock: Mocked<PlanResultCacheService>;
  let serviceReferenceManagerMock: Mocked<ServiceReferenceManager>;
  let onResetListener: (() => void) | undefined;

  let planParamsOperationsManager: PlanParamsOperationsManager;

  beforeAll(() => {
    activationServiceMock = {
      get: vitest.fn(),
    } as Partial<Mocked<ActivationsService>> as Mocked<ActivationsService>;

    bindingServiceMock = {
      get: vitest.fn(),
      getChained: vitest.fn(),
      set: vitest.fn(),
    } as Partial<Mocked<BindingService>> as Mocked<BindingService>;

    planResultCacheServiceMock = {
      get: vitest.fn(),
      invalidateServiceBinding: vitest.fn(),
      set: vitest.fn(),
      setNonCachedServiceNode: vitest.fn(),
    } as Partial<
      Mocked<PlanResultCacheService>
    > as Mocked<PlanResultCacheService>;

    onResetListener = undefined;

    serviceReferenceManagerMock = {
      activationService: activationServiceMock,
      bindingService: bindingServiceMock,
      onReset: vitest.fn((listener: () => void): void => {
        onResetListener = listener;
      }),
      planResultCacheService: planResultCacheServiceMock,
    } as Partial<
      Mocked<ServiceReferenceManager>
    > as Mocked<ServiceReferenceManager>;

    planParamsOperationsManager = new PlanParamsOperationsManager(
      serviceReferenceManagerMock,
    );
  });

  describe('constructor', () => {
    describe('when called', () => {
      it('should call serviceReferenceManager.onReset()', () => {
        expect(
          serviceReferenceManagerMock.onReset,
        ).toHaveBeenCalledExactlyOnceWith(expect.any(Function));
      });

      it('should set planParamsOperations.getClassMetadata', () => {
        expect(
          planParamsOperationsManager.planParamsOperations.getClassMetadata,
        ).toBe(getClassMetadata);
      });
    });
  });

  describe('.planParamsOperations.getActivations', () => {
    describe('when called', () => {
      let serviceIdentifierFixture: ServiceIdentifier;
      let activationsFixture: Iterable<BindingActivation>;

      let result: unknown;

      beforeAll(() => {
        serviceIdentifierFixture = 'service-id';
        activationsFixture = [vitest.fn() as BindingActivation];

        vitest
          .mocked(activationServiceMock.get)
          .mockReturnValueOnce(activationsFixture);

        result =
          planParamsOperationsManager.planParamsOperations.getActivations(
            serviceIdentifierFixture,
          );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call activationService.get()', () => {
        expect(activationServiceMock.get).toHaveBeenCalledExactlyOnceWith(
          serviceIdentifierFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(activationsFixture);
      });
    });
  });

  describe('.planParamsOperations.setBinding', () => {
    describe('when called', () => {
      let bindingFixture: Binding;

      let result: unknown;

      beforeAll(() => {
        bindingFixture = Symbol() as unknown as Binding;

        result =
          planParamsOperationsManager.planParamsOperations.setBinding(
            bindingFixture,
          );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call bindingService.set()', () => {
        expect(bindingServiceMock.set).toHaveBeenCalledExactlyOnceWith(
          bindingFixture,
        );
      });

      it('should call planResultCacheService.invalidateServiceBinding()', () => {
        expect(
          planResultCacheServiceMock.invalidateServiceBinding,
        ).toHaveBeenCalledExactlyOnceWith({
          binding: bindingFixture,
          kind: CacheBindingInvalidationKind.bindingAdded,
          operations: planParamsOperationsManager.planParamsOperations,
        });
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('when serviceReferenceManager.onReset() listener is called', () => {
    let newActivationServiceMock: Mocked<ActivationsService>;
    let newBindingServiceMock: Mocked<BindingService>;

    beforeAll(() => {
      newActivationServiceMock = {
        get: vitest.fn(),
      } as Partial<Mocked<ActivationsService>> as Mocked<ActivationsService>;

      newBindingServiceMock = {
        get: vitest.fn(),
        getChained: vitest.fn(),
        set: vitest.fn(),
      } as Partial<Mocked<BindingService>> as Mocked<BindingService>;

      serviceReferenceManagerMock.activationService = newActivationServiceMock;
      serviceReferenceManagerMock.bindingService = newBindingServiceMock;

      onResetListener?.();
    });

    describe('.planParamsOperations.getActivations', () => {
      describe('when called', () => {
        let serviceIdentifierFixture: ServiceIdentifier;
        let activationsFixture: Iterable<BindingActivation>;

        let result: unknown;

        beforeAll(() => {
          serviceIdentifierFixture = 'service-id';
          activationsFixture = [vitest.fn() as BindingActivation];

          vitest
            .mocked(newActivationServiceMock.get)
            .mockReturnValueOnce(activationsFixture);

          result =
            planParamsOperationsManager.planParamsOperations.getActivations(
              serviceIdentifierFixture,
            );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should call new activationService.get()', () => {
          expect(newActivationServiceMock.get).toHaveBeenCalledExactlyOnceWith(
            serviceIdentifierFixture,
          );
        });

        it('should not call previous activationService.get()', () => {
          expect(activationServiceMock.get).not.toHaveBeenCalled();
        });

        it('should return expected result', () => {
          expect(result).toBe(activationsFixture);
        });
      });
    });
  });
});
