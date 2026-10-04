import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('../calculations/rpcParameter.js'));

import { rpcParameter } from '../calculations/rpcParameter.js';
import { RpcParameterType } from '../models/RpcParameterType.js';
import { Callback } from './Callback.js';

describe(Callback, () => {
  describe('having no pipes', () => {
    describe('when called', () => {
      let parameterDecoratorFixture: ParameterDecorator;
      let result: unknown;

      beforeAll(() => {
        parameterDecoratorFixture = vitest.fn();

        vitest
          .mocked(rpcParameter)
          .mockReturnValueOnce(parameterDecoratorFixture);

        result = Callback();
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call rpcParameter()', () => {
        expect(rpcParameter).toHaveBeenCalledExactlyOnceWith({
          parameterType: RpcParameterType.Callback,
          pipeList: [],
        });
      });

      it('should return the parameter decorator', () => {
        expect(result).toBe(parameterDecoratorFixture);
      });
    });
  });
});
