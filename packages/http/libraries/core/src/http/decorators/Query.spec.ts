import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('../calculations/buildRequestParameterDecorator');

import { buildRequestParameterDecorator } from '../calculations/buildRequestParameterDecorator';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { query } from './Query';

describe(query.name, () => {
  describe('when called', () => {
    let parameterFixture: undefined;
    let parameterDecoratorFixture: ParameterDecorator;
    let result: unknown;

    beforeAll(() => {
      parameterFixture = undefined;
      parameterDecoratorFixture = {} as ParameterDecorator;

      vitest
        .mocked(buildRequestParameterDecorator)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = query(parameterFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call requestParam', () => {
      expect(buildRequestParameterDecorator).toHaveBeenCalledTimes(1);
      expect(buildRequestParameterDecorator).toHaveBeenCalledWith(
        RequestMethodParameterType.QUERY,
        [],
        parameterFixture,
      );
    });

    it('should return a ParameterDecorator', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
