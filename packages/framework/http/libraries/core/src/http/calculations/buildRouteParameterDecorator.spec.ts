import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./requestParam');

import { Pipe } from '@inversifyjs/framework-core';
import { Newable } from 'inversify';

import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { RouteParamOptions } from '../models/RouteParamOptions';
import { buildRouteParameterDecorator } from './buildRouteParameterDecorator';
import { requestParam } from './requestParam';

describe(buildRouteParameterDecorator, () => {
  describe('having a RouteParameterOptions parameterNameOrPipe', () => {
    describe('when called', () => {
      let parameterTypeFixture: RequestMethodParameterType.Query;
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

        expect(requestParam).toHaveBeenCalledExactlyOnceWith(expected);
      });

      it('should return a ParameterDecorator', () => {
        expect(result).toBe(parameterDecoratorFixture);
      });
    });
  });

  describe('having a parameterNameOrPipe with type Pipe', () => {
    describe('when called', () => {
      let parameterTypeFixture: RequestMethodParameterType.Query;
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

        expect(requestParam).toHaveBeenCalledExactlyOnceWith(expected);
      });

      it('should return a ParameterDecorator', () => {
        expect(result).toBe(parameterDecoratorFixture);
      });
    });
  });

  describe('having a RouteParameterOptions parameterNameOrPipe and parameterPipeList length greater than 0', () => {
    describe('when called', () => {
      let parameterTypeFixture: RequestMethodParameterType.Query;
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

        expect(requestParam).toHaveBeenCalledExactlyOnceWith(expected);
      });

      it('should return a ParameterDecorator', () => {
        expect(result).toBe(parameterDecoratorFixture);
      });
    });
  });

  describe('having a custom parameter type with RouteParameterOptions', () => {
    describe('when called', () => {
      let parameterTypeFixture: RequestMethodParameterType.Custom;
      let parameterNameOrPipeFixture: RouteParamOptions;
      let parameterPipeListFixture: (Newable<Pipe> | Pipe)[];
      let customParameterDecoratorHandlerFixture: CustomParameterDecoratorHandler;
      let parameterDecoratorFixture: ParameterDecorator;
      let result: unknown;

      beforeAll(() => {
        parameterTypeFixture = RequestMethodParameterType.Custom;
        parameterNameOrPipeFixture = {
          name: 'customParam',
        };
        parameterPipeListFixture = [];
        customParameterDecoratorHandlerFixture = vitest.fn();
        parameterDecoratorFixture = {} as ParameterDecorator;

        vitest
          .mocked(requestParam)
          .mockReturnValueOnce(parameterDecoratorFixture);

        result = buildRouteParameterDecorator(
          parameterTypeFixture,
          parameterPipeListFixture,
          parameterNameOrPipeFixture,
          customParameterDecoratorHandlerFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call requestParam()', () => {
        const expected: ControllerMethodParameterMetadata = {
          customParameterDecoratorHandler:
            customParameterDecoratorHandlerFixture,
          parameterName: parameterNameOrPipeFixture.name,
          parameterType: parameterTypeFixture,
          pipeList: parameterPipeListFixture,
        };

        expect(requestParam).toHaveBeenCalledExactlyOnceWith(expected);
      });

      it('should return a ParameterDecorator', () => {
        expect(result).toBe(parameterDecoratorFixture);
      });
    });
  });
});
