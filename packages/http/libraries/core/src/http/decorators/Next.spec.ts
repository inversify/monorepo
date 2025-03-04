import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./RequestParam');

import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { next } from './Next';
import { requestParam } from './RequestParam';

describe(next.name, () => {
  describe('when called', () => {
    let parameterDecoratorFixture: ParameterDecorator;
    let result: unknown;

    beforeAll(() => {
      parameterDecoratorFixture = {} as ParameterDecorator;

      vitest
        .mocked(requestParam)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = next();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call requestParam', () => {
      expect(requestParam).toHaveBeenCalledTimes(1);
      expect(requestParam).toHaveBeenCalledWith(
        RequestMethodParameterType.NEXT,
      );
    });

    it('should return a ParameterDecorator', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
