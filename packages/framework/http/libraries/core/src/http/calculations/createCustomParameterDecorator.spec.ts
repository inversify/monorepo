import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./requestParam');

import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { createCustomParameterDecorator } from './createCustomParameterDecorator';
import { requestParam } from './requestParam';

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
