import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('../calculations/rpcParameter.js'));

import { type Pipe } from '@inversifyjs/framework-core';

import { rpcParameter } from '../calculations/rpcParameter.js';
import { RpcParameterType } from '../models/RpcParameterType.js';
import { Call } from './Call.js';

describe(Call, () => {
  describe('having a pipe', () => {
    let pipeFixture: Pipe;

    beforeAll(() => {
      pipeFixture = { execute: vitest.fn() };
    });

    describe('when called', () => {
      let parameterDecoratorFixture: ParameterDecorator;
      let result: unknown;

      beforeAll(() => {
        parameterDecoratorFixture = vitest.fn();

        vitest
          .mocked(rpcParameter)
          .mockReturnValueOnce(parameterDecoratorFixture);

        result = Call(pipeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call rpcParameter()', () => {
        expect(rpcParameter).toHaveBeenCalledExactlyOnceWith({
          parameterType: RpcParameterType.Call,
          pipeList: [pipeFixture],
        });
      });

      it('should return the parameter decorator', () => {
        expect(result).toBe(parameterDecoratorFixture);
      });
    });
  });
});
