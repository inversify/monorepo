import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('../calculations/requestParam');
vitest.mock('../calculations/getOptionsAndPipes');

import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { getOptionsAndPipes } from '../calculations/getOptionsAndPipes';
import { requestParam } from '../calculations/requestParam';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { RouteParamOptions } from '../models/RouteParamOptions';
import { Headers } from './Headers';

describe(Headers, () => {
  describe('when called', () => {
    let optionsFixture: RouteParamOptions | undefined;
    let parameterPipeListFixture: (ServiceIdentifier<Pipe> | Pipe)[];
    let parameterDecoratorFixture: ParameterDecorator;
    let result: unknown;

    beforeAll(() => {
      optionsFixture = undefined;
      parameterPipeListFixture = [Symbol()];
      parameterDecoratorFixture = {} as ParameterDecorator;

      vitest
        .mocked(getOptionsAndPipes)
        .mockReturnValueOnce([optionsFixture, parameterPipeListFixture]);

      vitest
        .mocked(requestParam)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = Headers(optionsFixture, ...parameterPipeListFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call requestParam()', () => {
      const expected: ControllerMethodParameterMetadata = {
        parameterName: optionsFixture?.name,
        parameterType: RequestMethodParameterType.Headers,
        pipeList: parameterPipeListFixture,
      };

      expect(requestParam).toHaveBeenCalledExactlyOnceWith(expected);
    });

    it('should return a ParameterDecorator', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
