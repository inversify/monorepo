import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('../calculations/nativeRequestParam');

import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { nativeRequestParam } from '../calculations/nativeRequestParam';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { Next } from './Next';

describe(Next, () => {
  describe('when called', () => {
    let parameterDecoratorFixture: ParameterDecorator;
    let result: unknown;

    beforeAll(() => {
      parameterDecoratorFixture = {} as ParameterDecorator;

      vitest
        .mocked(nativeRequestParam)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = Next();
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call nativeRequestParam()', () => {
      const expected: ControllerMethodParameterMetadata = {
        parameterName: undefined,
        parameterType: RequestMethodParameterType.Next,
        pipeList: [],
      };

      expect(nativeRequestParam).toHaveBeenCalledExactlyOnceWith(expected);
    });

    it('should return a ParameterDecorator', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
