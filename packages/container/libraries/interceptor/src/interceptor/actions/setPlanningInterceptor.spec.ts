import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('../../registry/actions/getPlanningRegistry');

import { getPlanningRegistry } from '../../registry/actions/getPlanningRegistry';
import { PlanningInterceptor } from '../models/PlanningInterceptor';
import { setPlanningInterceptor } from './setPlanningInterceptor';

describe(setPlanningInterceptor.name, () => {
  let handleFixture: symbol;
  let interceptorFixture: PlanningInterceptor;

  beforeAll(() => {
    handleFixture = Symbol();
    interceptorFixture = Symbol() as unknown as PlanningInterceptor;
  });

  describe('when called', () => {
    let globalRegistryMock: Mocked<Map<symbol, PlanningInterceptor>>;

    let result: unknown;

    beforeAll(() => {
      globalRegistryMock = {
        set: vitest.fn() as unknown,
      } as Partial<Mocked<Map<symbol, PlanningInterceptor>>> as Mocked<
        Map<symbol, PlanningInterceptor>
      >;

      vitest
        .mocked(getPlanningRegistry)
        .mockReturnValueOnce(globalRegistryMock);

      result = setPlanningInterceptor(handleFixture, interceptorFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getPlanningRegistry()', () => {
      expect(getPlanningRegistry).toHaveBeenCalledTimes(1);
      expect(getPlanningRegistry).toHaveBeenCalledWith();
    });

    it('should call globalRegistry.set()', () => {
      expect(globalRegistryMock.set).toHaveBeenCalledTimes(1);
      expect(globalRegistryMock.set).toHaveBeenCalledWith(
        handleFixture,
        interceptorFixture,
      );
    });

    it('should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });
});
