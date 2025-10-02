import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('../calculations/buildRouteParameterDecorator');

import { buildRouteParameterDecorator } from '../calculations/buildRouteParameterDecorator';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { Next } from './Next';

describe(Next, () => {
  describe('when called', () => {
    let parameterDecoratorFixture: ParameterDecorator;
    let result: unknown;

    beforeAll(() => {
      parameterDecoratorFixture = {} as ParameterDecorator;

      vitest
        .mocked(buildRouteParameterDecorator)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = Next();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call buildRouteParameterDecorator()', () => {
      expect(buildRouteParameterDecorator).toHaveBeenCalledExactlyOnceWith(
        RequestMethodParameterType.Next,
        [],
      );
    });

    it('should return a ParameterDecorator', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
