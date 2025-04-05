import { beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./setPlanningInterceptor');

import { PlanningInterceptor } from '../models/PlanningInterceptor';
import { createPlanningInterceptor } from './createPlanningInterceptor';
import { setPlanningInterceptor } from './setPlanningInterceptor';

describe(createPlanningInterceptor.name, () => {
  let interceptorFixture: PlanningInterceptor;

  beforeAll(() => {
    interceptorFixture = Symbol() as unknown as PlanningInterceptor;
  });

  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = createPlanningInterceptor(interceptorFixture);
    });

    it('should call setPlanningInterceptor()', () => {
      expect(setPlanningInterceptor).toHaveBeenCalledTimes(1);
      expect(setPlanningInterceptor).toHaveBeenCalledWith(
        expect.any(Symbol),
        interceptorFixture,
      );
    });

    it('should return a symbol', () => {
      expect(result).toStrictEqual(expect.any(Symbol));
    });
  });
});
