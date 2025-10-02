import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/http-core');

import { createCustomParameterDecorator } from '@inversifyjs/http-core';

import { HonoUserSession } from './HonoUserSession';

describe(HonoUserSession, () => {
  describe('when called', () => {
    let parameterDecoratorFixture: ParameterDecorator;

    let result: unknown;

    beforeAll(() => {
      parameterDecoratorFixture = Symbol() as unknown as ParameterDecorator;

      vitest
        .mocked(createCustomParameterDecorator)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = HonoUserSession();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call createCustomParameterDecorator()', () => {
      expect(createCustomParameterDecorator).toHaveBeenCalledExactlyOnceWith(
        expect.any(Function),
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
