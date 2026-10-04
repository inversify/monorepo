import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('@inversifyjs/framework-core'));

import { applyPipeList, type Pipe } from '@inversifyjs/framework-core';
import { type Container } from 'inversify';

import { type CustomParameterDecoratorHandler } from '../../service/models/CustomParameterDecoratorHandler.js';
import { RpcParameterType } from '../../service/models/RpcParameterType.js';
import { type RpcParamsBuilder } from '../models/RpcParamsBuilder.js';
import { buildRpcParamsBuilder } from './buildRpcParamsBuilder.js';

describe(buildRpcParamsBuilder, () => {
  let callFixture: object;
  let callbackFixture: () => void;
  let containerFixture: Container;
  let responseFixture: object;
  let targetClassFixture: NewableFunction;

  beforeAll(() => {
    callFixture = { id: 'call' };
    callbackFixture = (): void => undefined;
    containerFixture = Symbol() as unknown as Mocked<Container>;
    responseFixture = { id: 'response' };
    targetClassFixture = class HeroService {};
  });

  describe('having no parameter metadata', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildRpcParamsBuilder(
          containerFixture,
          [],
          targetClassFixture,
          'getHero',
          [],
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having @Callback(), an undecorated parameter and @Call() without pipes', () => {
    describe('when called, and the params builder is invoked', () => {
      let result: unknown;

      beforeAll(() => {
        const buildParams: RpcParamsBuilder | undefined = buildRpcParamsBuilder(
          containerFixture,
          [],
          targetClassFixture,
          'getHero',
          [
            {
              parameterType: RpcParameterType.Callback,
              pipeList: [],
            },
            undefined,
            {
              parameterType: RpcParameterType.Call,
              pipeList: [],
            },
          ],
        );

        result = buildParams?.(callFixture, callbackFixture, responseFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should build the params synchronously', () => {
        expect(result).toStrictEqual([callbackFixture, undefined, callFixture]);
      });

      it('should not call applyPipeList()', () => {
        expect(applyPipeList).not.toHaveBeenCalled();
      });
    });
  });

  describe('having a custom parameter, a parameter pipe and a global pipe', () => {
    let customHandlerMock: Mock<CustomParameterDecoratorHandler>;
    let globalPipeFixture: Pipe;
    let parameterPipeFixture: Pipe;

    beforeAll(() => {
      customHandlerMock = vitest.fn();
      globalPipeFixture = { execute: vitest.fn() };
      parameterPipeFixture = { execute: vitest.fn() };
    });

    describe('when called, and the params builder is invoked', () => {
      let result: unknown;

      beforeAll(async () => {
        customHandlerMock.mockResolvedValueOnce('custom-value');

        const buildParams: RpcParamsBuilder | undefined = buildRpcParamsBuilder(
          containerFixture,
          [globalPipeFixture],
          targetClassFixture,
          'getHero',
          [
            {
              customParameterDecoratorHandler: customHandlerMock,
              parameterType: RpcParameterType.Custom,
              pipeList: [parameterPipeFixture],
            },
          ],
        );

        result = await buildParams?.(
          callFixture,
          callbackFixture,
          responseFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call the custom handler with the call and response', () => {
        expect(customHandlerMock).toHaveBeenCalledExactlyOnceWith(
          callFixture,
          responseFixture,
        );
      });

      it('should call applyPipeList() with global pipes before parameter pipes', () => {
        expect(applyPipeList).toHaveBeenCalledExactlyOnceWith(
          containerFixture,
          ['custom-value'],
          [globalPipeFixture, parameterPipeFixture],
          {
            methodName: 'getHero',
            parameterIndex: 0,
            targetClass: targetClassFixture,
          },
        );
      });

      it('should return the params', () => {
        expect(result).toStrictEqual(['custom-value']);
      });
    });
  });

  describe('having a custom parameter without pipes', () => {
    describe('when called, and the params builder is invoked', () => {
      let result: unknown;

      beforeAll(async () => {
        const buildParams: RpcParamsBuilder | undefined = buildRpcParamsBuilder(
          containerFixture,
          [],
          targetClassFixture,
          'getHero',
          [
            {
              customParameterDecoratorHandler: async (): Promise<string> =>
                'custom-value',
              parameterType: RpcParameterType.Custom,
              pipeList: [],
            },
          ],
        );

        result = await buildParams?.(
          callFixture,
          callbackFixture,
          responseFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should await the custom value', () => {
        expect(result).toStrictEqual(['custom-value']);
      });

      it('should not call applyPipeList()', () => {
        expect(applyPipeList).not.toHaveBeenCalled();
      });
    });
  });
});
