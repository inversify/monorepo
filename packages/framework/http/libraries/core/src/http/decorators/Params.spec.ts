import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('../calculations/requestParam.js'));
vitest.mock(import('../calculations/getOptionsAndPipes.js'));

import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { type ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata.js';
import { getOptionsAndPipes } from '../calculations/getOptionsAndPipes.js';
import { requestParam } from '../calculations/requestParam.js';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType.js';
import { Params } from './Params.js';

describe(Params, () => {
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
        .mocked(getOptionsAndPipes)
        .mockReturnValueOnce([optionsFixture, parameterPipeListFixture]);

      vitest
        .mocked(requestParam)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = Params(optionsFixture, ...parameterPipeListFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call requestParam()', () => {
      const expected: ControllerMethodParameterMetadata = {
        parameterName: undefined,
        parameterType: RequestMethodParameterType.Params,
        pipeList: parameterPipeListFixture,
      };

      expect(requestParam).toHaveBeenCalledExactlyOnceWith(expected);
    });

    it('should return a ParameterDecorator', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
