import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

jest.mock('./RequestParam');

import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { params } from './Params';
import { requestParam } from './RequestParam';

describe(params.name, () => {
  describe('when called', () => {
    let parameterNameFixture: string | undefined;
    let parameterDecoratorFixture: ParameterDecorator;
    let result: unknown;

    beforeAll(() => {
      parameterNameFixture = undefined;
      parameterDecoratorFixture = {} as ParameterDecorator;

      (requestParam as jest.Mocked<typeof requestParam>).mockReturnValueOnce(
        parameterDecoratorFixture,
      );

      result = params(parameterNameFixture);
    });

    afterAll(() => {
      jest.clearAllMocks();
    });

    it('should call requestParam', () => {
      expect(requestParam).toHaveBeenCalledTimes(1);
      expect(requestParam).toHaveBeenCalledWith(
        RequestMethodParameterType.PARAMS,
        parameterNameFixture,
      );
    });

    it('should return a ParameterDecorator', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
