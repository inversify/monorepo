import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('../calculations/nativeRequestParam.js'));

import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { type ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata.js';
import { nativeRequestParam } from '../calculations/nativeRequestParam.js';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType.js';
import { Response } from './Response.js';

describe(Response, () => {
  describe('when called', () => {
    let parameterPipeListFixture: (ServiceIdentifier<Pipe> | Pipe)[];
    let parameterDecoratorFixture: ParameterDecorator;
    let result: unknown;

    beforeAll(() => {
      parameterPipeListFixture = [Symbol()];
      parameterDecoratorFixture = {} as ParameterDecorator;

      vitest
        .mocked(nativeRequestParam)
        .mockReturnValueOnce(parameterDecoratorFixture);

      result = Response(...parameterPipeListFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call nativeRequestParam()', () => {
      const expected: ControllerMethodParameterMetadata = {
        parameterName: undefined,
        parameterType: RequestMethodParameterType.Response,
        pipeList: parameterPipeListFixture,
      };

      expect(nativeRequestParam).toHaveBeenCalledExactlyOnceWith(expected);
    });

    it('should return a ParameterDecorator', () => {
      expect(result).toBe(parameterDecoratorFixture);
    });
  });
});
