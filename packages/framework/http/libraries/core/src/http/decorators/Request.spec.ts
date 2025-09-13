import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('../calculations/buildRequestParameterDecorator');

import { buildRequestParameterDecorator } from '../calculations/buildRequestParameterDecorator';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { Request } from './Request';

describe(Request, () => {
  describe('when called', () => {
    let parameterDecoratorFixture: ParameterDecorator;
    let result: unknown;

    beforeAll(() => {
      parameterDecoratorFixture = {} as ParameterDecorator;

      vitest
        .mocked(buildRequestParameterDecorator)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = Request();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call RequestParamFactory', () => {
      expect(buildRequestParameterDecorator).toHaveBeenCalledTimes(1);
      expect(buildRequestParameterDecorator).toHaveBeenCalledWith(
        RequestMethodParameterType.Request,
        [],
      );
    });

    it('should return a ParameterDecorator', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
