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
  Binding,
  CacheBindingInvalidationKind,
  PlanParamsOperations,
  PlanResultCacheService,
} from '@inversifyjs/core';

import { CacheBindingInvalidation } from '../models/CacheBindingInvalidation';
import { PlanParamsOperationsManager } from './PlanParamsOperationsManager';
import { PlanResultCacheManager } from './PlanResultCacheManager';
import { ServiceReferenceManager } from './ServiceReferenceManager';

describe(PlanResultCacheManager, () => {
  let planParamsOperationsManagerFixture: PlanParamsOperationsManager;
  let serviceReferenceManagerMock: Mocked<ServiceReferenceManager>;

  let planResultCacheManager: PlanResultCacheManager;

  beforeAll(() => {
    planParamsOperationsManagerFixture = {
      planParamsOperations: Symbol() as unknown as PlanParamsOperations,
    } as Partial<PlanParamsOperationsManager> as PlanParamsOperationsManager;

    serviceReferenceManagerMock = {
      planResultCacheService: {
        invalidateServiceBinding: vitest.fn(),
      } as Partial<
        Mocked<PlanResultCacheService>
      > as Mocked<PlanResultCacheService>,
    } as Partial<ServiceReferenceManager> as Mocked<ServiceReferenceManager>;

    planResultCacheManager = new PlanResultCacheManager(
      planParamsOperationsManagerFixture,
      serviceReferenceManagerMock,
    );
  });

  describe('.invalidateService', () => {
    describe('when called', () => {
      let invalidationFixture: CacheBindingInvalidation;

      let result: unknown;

      beforeAll(() => {
        invalidationFixture = {
          binding: Symbol() as unknown as Binding<unknown>,
          kind: CacheBindingInvalidationKind.bindingAdded,
        };

        result = planResultCacheManager.invalidateService(invalidationFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call planResultCacheService.invalidateServiceBinding with the correct parameters', () => {
        expect(
          serviceReferenceManagerMock.planResultCacheService
            .invalidateServiceBinding,
        ).toHaveBeenCalledExactlyOnceWith({
          ...invalidationFixture,
          operations: planParamsOperationsManagerFixture.planParamsOperations,
        });
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
