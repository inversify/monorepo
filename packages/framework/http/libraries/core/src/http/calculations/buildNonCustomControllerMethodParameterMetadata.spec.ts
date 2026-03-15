import { beforeAll, describe, expect, it } from 'vitest';

import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { type ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata.js';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType.js';
import { type RouteParamOptions } from '../models/RouteParamOptions.js';
import { buildNonCustomControllerMethodParameterMetadata } from './buildNonCustomControllerMethodParameterMetadata.js';

describe(buildNonCustomControllerMethodParameterMetadata, () => {
  describe('having options with a name', () => {
    describe('when called', () => {
      let parameterTypeFixture: RequestMethodParameterType.Query;
      let parameterPipeListFixture: (ServiceIdentifier<Pipe> | Pipe)[];
      let optionsFixture: RouteParamOptions;
      let result: unknown;

      beforeAll(() => {
        parameterTypeFixture = RequestMethodParameterType.Query;
        parameterPipeListFixture = [Symbol() as unknown as Pipe];
        optionsFixture = { name: 'testParam' };

        result = buildNonCustomControllerMethodParameterMetadata(
          parameterTypeFixture,
          parameterPipeListFixture,
          optionsFixture,
        );
      });

      it('should return expected result', () => {
        const expected: ControllerMethodParameterMetadata = {
          parameterName: 'testParam',
          parameterType: RequestMethodParameterType.Query,
          pipeList: parameterPipeListFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having undefined options', () => {
    describe('when called', () => {
      let parameterTypeFixture: RequestMethodParameterType.Body;
      let parameterPipeListFixture: (ServiceIdentifier<Pipe> | Pipe)[];
      let optionsFixture: undefined;
      let result: unknown;

      beforeAll(() => {
        parameterTypeFixture = RequestMethodParameterType.Body;
        parameterPipeListFixture = [];
        optionsFixture = undefined;

        result = buildNonCustomControllerMethodParameterMetadata(
          parameterTypeFixture,
          parameterPipeListFixture,
          optionsFixture,
        );
      });

      it('should return expected result', () => {
        const expected: ControllerMethodParameterMetadata = {
          parameterName: undefined,
          parameterType: RequestMethodParameterType.Body,
          pipeList: parameterPipeListFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having options without a name', () => {
    describe('when called', () => {
      let parameterTypeFixture: RequestMethodParameterType.Params;
      let parameterPipeListFixture: (ServiceIdentifier<Pipe> | Pipe)[];
      let optionsFixture: RouteParamOptions;
      let result: unknown;

      beforeAll(() => {
        parameterTypeFixture = RequestMethodParameterType.Params;
        parameterPipeListFixture = [Symbol() as unknown as Pipe];
        optionsFixture = {};

        result = buildNonCustomControllerMethodParameterMetadata(
          parameterTypeFixture,
          parameterPipeListFixture,
          optionsFixture,
        );
      });

      it('should return ControllerMethodParameterMetadata with undefined parameterName', () => {
        const expected: ControllerMethodParameterMetadata = {
          parameterName: undefined,
          parameterType: RequestMethodParameterType.Params,
          pipeList: parameterPipeListFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
