import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('../calculations/requestParam.js'));
vitest.mock(import('../calculations/getOptionsAndPipes.js'));

import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { type ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata.js';
import { getOptionsAndPipes } from '../calculations/getOptionsAndPipes.js';
import { requestParam } from '../calculations/requestParam.js';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType.js';
import { Query } from './Query.js';

describe(Query, () => {
  describe('when called', () => {
    let parameterFixture: undefined;
    let parameterPipeListFixture: (ServiceIdentifier<Pipe> | Pipe)[];
    let parameterDecoratorFixture: ParameterDecorator;
    let result: unknown;

    beforeAll(() => {
      parameterFixture = undefined;
      parameterPipeListFixture = [Symbol()];
      parameterDecoratorFixture = {} as ParameterDecorator;

      vitest
        .mocked(getOptionsAndPipes)
        .mockReturnValueOnce([parameterFixture, parameterPipeListFixture]);

      vitest
        .mocked(requestParam)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = Query(parameterFixture, ...parameterPipeListFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call requestParam()', () => {
      const expected: ControllerMethodParameterMetadata = {
        parameterName: undefined,
        parameterType: RequestMethodParameterType.Query,
        pipeList: parameterPipeListFixture,
      };

      expect(requestParam).toHaveBeenCalledExactlyOnceWith(expected);
    });

    it('should return a ParameterDecorator', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
