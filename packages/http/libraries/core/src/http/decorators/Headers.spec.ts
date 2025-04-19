import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('../calculations/buildRequestParameterDecorator');

import { buildRequestParameterDecorator } from '../calculations/buildRequestParameterDecorator';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { headers } from './Headers';

describe(headers.name, () => {
  describe('when called', () => {
    let parameterNameFixture: string | undefined;
    let parameterDecoratorFixture: ParameterDecorator;
    let result: unknown;

    beforeAll(() => {
      parameterNameFixture = undefined;
      parameterDecoratorFixture = {} as ParameterDecorator;

      vitest
        .mocked(buildRequestParameterDecorator)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = headers(parameterNameFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call requestParamFactory', () => {
      expect(buildRequestParameterDecorator).toHaveBeenCalledTimes(1);
      expect(buildRequestParameterDecorator).toHaveBeenCalledWith(
        RequestMethodParameterType.HEADERS,
        [],
        parameterNameFixture,
      );
    });

    it('should return a ParameterDecorator', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
