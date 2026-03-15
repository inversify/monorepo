import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./requestParam.js'));

import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { type ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata.js';
import { type CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler.js';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType.js';
import { createCustomParameterDecorator } from './createCustomParameterDecorator.js';
import { requestParam } from './requestParam.js';

describe(createCustomParameterDecorator, () => {
  describe('when called', () => {
    let handlerFixture: CustomParameterDecoratorHandler;
    let parameterPipeListFixture: (ServiceIdentifier<Pipe> | Pipe)[];
    let parameterDecoratorFixture: ParameterDecorator;
    let result: unknown;

    beforeAll(() => {
      handlerFixture = Symbol() as unknown as CustomParameterDecoratorHandler;
      parameterPipeListFixture = [Symbol()];
      parameterDecoratorFixture = {} as ParameterDecorator;

      vitest
        .mocked(requestParam)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = createCustomParameterDecorator(
        handlerFixture,
        ...parameterPipeListFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call requestParam', () => {
      const expected: ControllerMethodParameterMetadata = {
        customParameterDecoratorHandler: handlerFixture,
        parameterName: undefined,
        parameterType: RequestMethodParameterType.Custom,
        pipeList: parameterPipeListFixture,
      };

      expect(requestParam).toHaveBeenCalledExactlyOnceWith(expected);
    });

    it('should return a ParameterDecorator', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
