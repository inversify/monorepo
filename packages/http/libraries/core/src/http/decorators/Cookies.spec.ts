import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./RequestParam');

import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { cookies } from './Cookies';
import { requestParam } from './RequestParam';

describe(cookies.name, () => {
  describe('when called', () => {
    let parameterNameFixture: string | undefined;
    let parameterDecoratorFixture: ParameterDecorator;
    let result: unknown;

    beforeAll(() => {
      parameterNameFixture = undefined;
      parameterDecoratorFixture = {} as ParameterDecorator;

      vitest
        .mocked(requestParam)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = cookies(parameterNameFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call requestParam', () => {
      expect(requestParam).toHaveBeenCalledTimes(1);
      expect(requestParam).toHaveBeenCalledWith(
        RequestMethodParameterType.COOKIES,
        parameterNameFixture,
      );
    });

    it('should return a ParameterDecorator', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
