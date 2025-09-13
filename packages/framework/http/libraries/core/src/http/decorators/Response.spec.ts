import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('../calculations/buildRequestParameterDecorator');

import { buildRequestParameterDecorator } from '../calculations/buildRequestParameterDecorator';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { Response } from './Response';

describe(Response, () => {
  describe('when called', () => {
    let parameterDecoratorFixture: ParameterDecorator;
    let result: unknown;

    beforeAll(() => {
      parameterDecoratorFixture = {} as ParameterDecorator;

      vitest
        .mocked(buildRequestParameterDecorator)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = Response();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call requestParamFactory', () => {
      expect(buildRequestParameterDecorator).toHaveBeenCalledTimes(1);
      expect(buildRequestParameterDecorator).toHaveBeenCalledWith(
        RequestMethodParameterType.Response,
        [],
      );
    });

    it('should return a ParameterDecorator', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
