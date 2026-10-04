import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./rpcParameter.js'));

import { type Pipe } from '@inversifyjs/framework-core';

import { type CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler.js';
import { RpcParameterType } from '../models/RpcParameterType.js';
import { createCustomParameterDecorator } from './createCustomParameterDecorator.js';
import { rpcParameter } from './rpcParameter.js';

describe(createCustomParameterDecorator, () => {
  describe('having a handler and a pipe', () => {
    let handlerFixture: CustomParameterDecoratorHandler;
    let pipeFixture: Pipe;

    beforeAll(() => {
      handlerFixture = (): string => 'value';
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

        result = createCustomParameterDecorator(handlerFixture, pipeFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call rpcParameter()', () => {
        expect(rpcParameter).toHaveBeenCalledExactlyOnceWith({
          customParameterDecoratorHandler: handlerFixture,
          parameterType: RpcParameterType.Custom,
          pipeList: [pipeFixture],
        });
      });

      it('should return the parameter decorator', () => {
        expect(result).toBe(parameterDecoratorFixture);
      });
    });
  });
});
