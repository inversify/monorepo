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
import { getPlanningInterceptor } from './getPlanningInterceptor';

describe(getPlanningInterceptor.name, () => {
  describe('when called', () => {
    let globalRegistryMock: Mocked<Map<symbol, PlanningInterceptor>>;
    let planningInterceptorFixture: PlanningInterceptor;

    let result: unknown;

    beforeAll(() => {
      globalRegistryMock = {
        get: vitest.fn(),
      } as Partial<Mocked<Map<symbol, PlanningInterceptor>>> as Mocked<
        Map<symbol, PlanningInterceptor>
      >;

      planningInterceptorFixture = Symbol() as unknown as PlanningInterceptor;

      vitest
        .mocked(getPlanningRegistry)
        .mockReturnValueOnce(globalRegistryMock);

      globalRegistryMock.get.mockReturnValueOnce(planningInterceptorFixture);

      result = getPlanningInterceptor(Symbol());
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call getPlanningRegistry()', () => {
      expect(getPlanningRegistry).toHaveBeenCalledTimes(1);
      expect(getPlanningRegistry).toHaveBeenCalledWith();
    });

    it('should call get()', () => {
      expect(globalRegistryMock.get).toHaveBeenCalledTimes(1);
      expect(globalRegistryMock.get).toHaveBeenCalledWith(expect.any(Symbol));
    });

    it('should return PlanningInterceptor', () => {
      expect(result).toBe(planningInterceptorFixture);
    });
  });
});
