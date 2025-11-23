import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./requestParam');

import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { CustomNativeParameterDecoratorHandler } from '../models/CustomNativeParameterDecoratorHandler';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { createCustomNativeParameterDecorator } from './createCustomNativeParameterDecorator';
import { requestParam } from './requestParam';

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
        .mocked(requestParam)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = createCustomNativeParameterDecorator(
        handlerFixture,
        ...parameterPipeListFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call requestParam()', () => {
      const expected: ControllerMethodParameterMetadata = {
        customParameterDecoratorHandler: handlerFixture,
        parameterName: undefined,
        parameterType: RequestMethodParameterType.CustomNative,
        pipeList: parameterPipeListFixture,
      };

      expect(requestParam).toHaveBeenCalledExactlyOnceWith(expected);
    });

    it('should return expected result', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
