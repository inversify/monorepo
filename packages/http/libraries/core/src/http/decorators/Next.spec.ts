import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('../calculations/buildRequestParameterDecorator');

import { buildRequestParameterDecorator } from '../calculations/buildRequestParameterDecorator';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { next } from './Next';

describe(next.name, () => {
  describe('when called', () => {
    let parameterDecoratorFixture: ParameterDecorator;
    let result: unknown;

    beforeAll(() => {
      parameterDecoratorFixture = {} as ParameterDecorator;

      vitest
        .mocked(buildRequestParameterDecorator)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = next();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call requestParamFactory', () => {
      expect(buildRequestParameterDecorator).toHaveBeenCalledTimes(1);
      expect(buildRequestParameterDecorator).toHaveBeenCalledWith(
        RequestMethodParameterType.NEXT,
        [],
      );
    });

    it('should return a ParameterDecorator', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
