import { beforeAll, describe, expect, it } from 'vitest';

import { PlanningInterceptor } from '../../interceptor/models/PlanningInterceptor';
import { getPlanningRegistry } from './getPlanningRegistry';

describe(getPlanningRegistry.name, () => {
  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = getPlanningRegistry();
    });

    it('should return a Map', () => {
      expect(result).toStrictEqual(new Map());
    });
  });

  describe('having a defined global registry', () => {
    let getPlanningRegistryFixture: Map<symbol, PlanningInterceptor>;

    beforeAll(() => {
      getPlanningRegistryFixture = new Map();

      globalThis.__INVERSIFY_PLANNING_INTERCEPTOR_REGISTRY =
        getPlanningRegistryFixture;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getPlanningRegistry();
      });

      it('should return a Map', () => {
        expect(result).toBe(getPlanningRegistryFixture);
      });
    });
  });
});
