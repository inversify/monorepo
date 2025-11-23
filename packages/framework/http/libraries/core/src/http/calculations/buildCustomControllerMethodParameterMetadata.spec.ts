import { beforeAll, describe, expect, it } from 'vitest';

import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { CustomParameterDecoratorHandler } from '../models/CustomParameterDecoratorHandler';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { buildCustomControllerMethodParameterMetadata } from './buildCustomControllerMethodParameterMetadata';

describe(buildCustomControllerMethodParameterMetadata, () => {
  describe('having a handler and pipes', () => {
    describe('when called', () => {
      let parameterPipeListFixture: (ServiceIdentifier<Pipe> | Pipe)[];
      let handlerFixture: CustomParameterDecoratorHandler;
      let result: unknown;

      beforeAll(() => {
        parameterPipeListFixture = [
          Symbol() as unknown as Pipe,
          Symbol() as unknown as Pipe,
        ];
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
        parameterPipeListFixture = [
          Symbol() as ServiceIdentifier<Pipe>,
          'PipeClass' as ServiceIdentifier<Pipe>,
        ];
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
