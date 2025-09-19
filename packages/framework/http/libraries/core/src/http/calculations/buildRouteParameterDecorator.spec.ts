import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./requestParam');

import { Pipe } from '@inversifyjs/framework-core';
import { Newable } from 'inversify';

import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { RouteParamOptions } from '../models/RouteParamOptions';
import { buildRouteParameterDecorator } from './buildRouteParameterDecorator';
import { requestParam } from './requestParam';

describe(buildRouteParameterDecorator, () => {
  describe('having a RouteParameterOptions parameterNameOrPipe', () => {
    describe('when called', () => {
      let parameterTypeFixture: RequestMethodParameterType;
      let parameterNameOrPipeFixture: RouteParamOptions;
      let parameterPipeListFixture: (Newable<Pipe> | Pipe)[];
      let parameterDecoratorFixture: ParameterDecorator;
      let result: unknown;

      beforeAll(() => {
        parameterTypeFixture = RequestMethodParameterType.Query;
        parameterNameOrPipeFixture = {
          name: 'parameterName',
        };
        parameterPipeListFixture = [];
        parameterDecoratorFixture = {} as ParameterDecorator;

        vitest
          .mocked(requestParam)
          .mockReturnValueOnce(parameterDecoratorFixture);

        result = buildRouteParameterDecorator(
          parameterTypeFixture,
          parameterPipeListFixture,
          parameterNameOrPipeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call requestParam()', () => {
        const expected: ControllerMethodParameterMetadata = {
          parameterName: parameterNameOrPipeFixture.name,
          parameterType: parameterTypeFixture,
          pipeList: parameterPipeListFixture,
        };

        expect(requestParam).toHaveBeenCalledTimes(1);
        expect(requestParam).toHaveBeenCalledWith(expected);
      });

      it('should return a ParameterDecorator', () => {
        expect(result).toBe(parameterDecoratorFixture);
      });
    });
  });

  describe('having a parameterNameOrPipe with type Pipe', () => {
    describe('when called', () => {
      let parameterTypeFixture: RequestMethodParameterType;
      let parameterNameOrPipeFixture: Pipe;
      let parameterPipeListFixture: (Newable<Pipe> | Pipe)[];
      let parameterDecoratorFixture: ParameterDecorator;
      let result: unknown;

      beforeAll(() => {
        parameterTypeFixture = RequestMethodParameterType.Query;
        parameterNameOrPipeFixture = { execute: () => {} };
        parameterPipeListFixture = [];
        parameterDecoratorFixture = {} as ParameterDecorator;

        vitest
          .mocked(requestParam)
          .mockReturnValueOnce(parameterDecoratorFixture);

        result = buildRouteParameterDecorator(
          parameterTypeFixture,
          parameterPipeListFixture,
          parameterNameOrPipeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call requestParam()', () => {
        const expected: ControllerMethodParameterMetadata = {
          parameterType: parameterTypeFixture,
          pipeList: [parameterNameOrPipeFixture],
        };

        expect(requestParam).toHaveBeenCalledTimes(1);
        expect(requestParam).toHaveBeenCalledWith(expected);
      });

      it('should return a ParameterDecorator', () => {
        expect(result).toBe(parameterDecoratorFixture);
      });
    });
  });

  describe('having a RouteParameterOptions parameterNameOrPipe and parameterPipeList length greater than 0', () => {
    describe('when called', () => {
      let parameterTypeFixture: RequestMethodParameterType;
      let parameterNameOrPipeFixture: RouteParamOptions;
      let parameterPipeListFixture: (Newable<Pipe> | Pipe)[];
      let parameterDecoratorFixture: ParameterDecorator;
      let result: unknown;

      beforeAll(() => {
        parameterTypeFixture = RequestMethodParameterType.Query;
        parameterNameOrPipeFixture = {
          name: 'parameterName',
        };
        parameterPipeListFixture = [{ execute: () => {} }];
        parameterDecoratorFixture = {} as ParameterDecorator;

        vitest
          .mocked(requestParam)
          .mockReturnValueOnce(parameterDecoratorFixture);

        result = buildRouteParameterDecorator(
          parameterTypeFixture,
          parameterPipeListFixture,
          parameterNameOrPipeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call requestParam()', () => {
        const expected: ControllerMethodParameterMetadata = {
          parameterName: parameterNameOrPipeFixture.name,
          parameterType: parameterTypeFixture,
          pipeList: parameterPipeListFixture,
        };

        expect(requestParam).toHaveBeenCalledTimes(1);
        expect(requestParam).toHaveBeenCalledWith(expected);
      });

      it('should return a ParameterDecorator', () => {
        expect(result).toBe(parameterDecoratorFixture);
      });
    });
  });
});
