import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('@inversifyjs/core'));

import {
  type BindingService,
  type DeactivationParams,
  type DeactivationsService,
  getClassMetadata,
} from '@inversifyjs/core';

import { type ServiceReferenceManager } from '../services/ServiceReferenceManager.js';
import { buildDeactivationParams } from './buildDeactivationParams.js';

describe(buildDeactivationParams, () => {
  let serviceReferenceManagerMock: ServiceReferenceManager;

  beforeAll(() => {
    serviceReferenceManagerMock = {
      bindingService: {
        get: vitest.fn(),
        getByModuleId: vitest.fn(),
      } as Partial<BindingService>,
      deactivationService: {
        get: vitest.fn(),
      } as Partial<DeactivationsService>,
    } as Partial<
      Mocked<ServiceReferenceManager>
    > as Mocked<ServiceReferenceManager>;
  });

  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = buildDeactivationParams(serviceReferenceManagerMock);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return the expected result', () => {
      const expected: DeactivationParams = {
        getBindings: expect.any(Function) as unknown,
        getBindingsFromModule: expect.any(Function) as unknown,
        getClassMetadata: vitest.mocked(getClassMetadata),
        getDeactivations: expect.any(Function) as unknown,
      } as Partial<DeactivationParams> as DeactivationParams;

      expect(result).toStrictEqual(expected);
    });
  });
});
