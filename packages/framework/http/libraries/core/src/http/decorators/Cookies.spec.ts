import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('../calculations/buildRouteParameterDecorator');

import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { buildRouteParameterDecorator } from '../calculations/buildRouteParameterDecorator';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { Cookies } from './Cookies';

describe(Cookies, () => {
  describe('when called', () => {
    let optionsFixture: undefined;
    let parameterPipeListFixture: (ServiceIdentifier<Pipe> | Pipe)[];
    let parameterDecoratorFixture: ParameterDecorator;
    let result: unknown;

    beforeAll(() => {
      optionsFixture = undefined;
      parameterPipeListFixture = [Symbol()];
      parameterDecoratorFixture = {} as ParameterDecorator;

      vitest
        .mocked(buildRouteParameterDecorator)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = Cookies(optionsFixture, ...parameterPipeListFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call buildRouteParameterDecorator()', () => {
      expect(buildRouteParameterDecorator).toHaveBeenCalledExactlyOnceWith(
        RequestMethodParameterType.Cookies,
        parameterPipeListFixture,
        optionsFixture,
      );
    });

    it('should return a ParameterDecorator', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
