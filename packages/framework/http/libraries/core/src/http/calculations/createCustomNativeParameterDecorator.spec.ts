import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./nativeRequestParam.js'));

import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { type ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata.js';
import { type CustomNativeParameterDecoratorHandler } from '../models/CustomNativeParameterDecoratorHandler.js';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType.js';
import { createCustomNativeParameterDecorator } from './createCustomNativeParameterDecorator.js';
import { nativeRequestParam } from './nativeRequestParam.js';

describe(createCustomNativeParameterDecorator, () => {
  describe('when called', () => {
    let handlerFixture: CustomNativeParameterDecoratorHandler;
    let parameterPipeListFixture: (ServiceIdentifier<Pipe> | Pipe)[];
    let parameterDecoratorFixture: ParameterDecorator;
    let result: unknown;

    beforeAll(() => {
      handlerFixture =
        Symbol() as unknown as CustomNativeParameterDecoratorHandler;
      parameterPipeListFixture = [Symbol()];
      parameterDecoratorFixture = {} as ParameterDecorator;

      vitest
        .mocked(nativeRequestParam)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = createCustomNativeParameterDecorator(
        handlerFixture,
        ...parameterPipeListFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call nativeRequestParam()', () => {
      const expected: ControllerMethodParameterMetadata = {
        customParameterDecoratorHandler: handlerFixture,
        parameterName: undefined,
        parameterType: RequestMethodParameterType.CustomNative,
        pipeList: parameterPipeListFixture,
      };

      expect(nativeRequestParam).toHaveBeenCalledExactlyOnceWith(expected);
    });

    it('should return expected result', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
