import { beforeAll, describe, expect, it } from 'vitest';

import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { type ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata.js';
import { type CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler.js';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType.js';
import { buildCustomControllerMethodParameterMetadata } from './buildCustomControllerMethodParameterMetadata.js';

describe(buildCustomControllerMethodParameterMetadata, () => {
  describe('having a handler and pipes', () => {
    describe('when called', () => {
      let parameterPipeListFixture: (ServiceIdentifier<Pipe> | Pipe)[];
      let handlerFixture: CustomParameterDecoratorHandler;
      let result: unknown;

      beforeAll(() => {
        parameterPipeListFixture = [Symbol(), Symbol()];
        handlerFixture = Symbol() as unknown as CustomParameterDecoratorHandler;

        result = buildCustomControllerMethodParameterMetadata(
          parameterPipeListFixture,
          handlerFixture,
        );
      });

      it('should return ControllerMethodParameterMetadata with all pipes', () => {
        const expected: ControllerMethodParameterMetadata = {
          customParameterDecoratorHandler: handlerFixture,
          parameterName: undefined,
          parameterType: RequestMethodParameterType.Custom,
          pipeList: parameterPipeListFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having ServiceIdentifier pipes', () => {
    describe('when called', () => {
      let parameterPipeListFixture: (ServiceIdentifier<Pipe> | Pipe)[];
      let handlerFixture: CustomParameterDecoratorHandler;
      let result: unknown;

      beforeAll(() => {
        parameterPipeListFixture = [Symbol(), 'PipeClass'];
        handlerFixture = Symbol() as unknown as CustomParameterDecoratorHandler;

        result = buildCustomControllerMethodParameterMetadata(
          parameterPipeListFixture,
          handlerFixture,
        );
      });

      it('should return expected result', () => {
        const expected: ControllerMethodParameterMetadata = {
          customParameterDecoratorHandler: handlerFixture,
          parameterName: undefined,
          parameterType: RequestMethodParameterType.Custom,
          pipeList: parameterPipeListFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
