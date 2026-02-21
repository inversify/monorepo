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
  type Binding,
  CacheBindingInvalidationKind,
  type PlanParamsOperations,
  type PlanResultCacheService,
} from '@inversifyjs/core';

import { type CacheBindingInvalidation } from '../models/CacheBindingInvalidation.js';
import { type PlanParamsOperationsManager } from './PlanParamsOperationsManager.js';
import { PlanResultCacheManager } from './PlanResultCacheManager.js';
import { type ServiceReferenceManager } from './ServiceReferenceManager.js';

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
      } as Partial<PlanResultCacheService>,
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
