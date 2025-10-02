import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('../calculations/buildRouteParameterDecorator');

import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { buildRouteParameterDecorator } from './buildRouteParameterDecorator';
import { createCustomParameterDecorator } from './createCustomParameterDecorator';

describe(createCustomParameterDecorator, () => {
  describe('when called', () => {
    let handlerFixture: CustomParameterDecoratorHandler;
    let parameterPipeListFixture: (ServiceIdentifier<Pipe> | Pipe)[];
    let parameterDecoratorFixture: ParameterDecorator;
    let result: unknown;

    beforeAll(() => {
      handlerFixture = Symbol() as unknown as CustomParameterDecoratorHandler;
      parameterPipeListFixture = [Symbol()];
      parameterDecoratorFixture = Symbol() as unknown as ParameterDecorator;

      vitest
        .mocked(buildRouteParameterDecorator)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = createCustomParameterDecorator(
        handlerFixture,
        ...parameterPipeListFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call requestParamFactory', () => {
      expect(buildRouteParameterDecorator).toHaveBeenCalledExactlyOnceWith(
        RequestMethodParameterType.Custom,
        parameterPipeListFixture,
        undefined,
        handlerFixture,
      );
    });

    it('should return a ParameterDecorator', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
