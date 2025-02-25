import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

jest.mock('./RequestParam');

import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { requestParam } from './RequestParam';
import { response } from './Response';

describe(response.name, () => {
  describe('when called', () => {
    let parameterDecoratorFixture: ParameterDecorator;
    let result: unknown;

    beforeAll(() => {
      parameterDecoratorFixture = {} as ParameterDecorator;

      (requestParam as jest.Mocked<typeof requestParam>).mockReturnValueOnce(
        parameterDecoratorFixture,
      );

      result = response();
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call requestParam', () => {
      expect(requestParam).toHaveBeenCalledTimes(1);
      expect(requestParam).toHaveBeenCalledWith(
        RequestMethodParameterType.RESPONSE,
      );
    });

    it('should return a ParameterDecorator', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
