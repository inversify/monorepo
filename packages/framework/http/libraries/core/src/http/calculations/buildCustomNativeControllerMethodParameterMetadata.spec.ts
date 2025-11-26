import { beforeAll, describe, expect, it } from 'vitest';

import { Pipe } from '@inversifyjs/framework-core';
import { ServiceIdentifier } from 'inversify';

import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { CustomNativeParameterDecoratorHandler } from '../models/CustomNativeParameterDecoratorHandler';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { buildCustomNativeControllerMethodParameterMetadata } from './buildCustomNativeControllerMethodParameterMetadata';

describe(buildCustomNativeControllerMethodParameterMetadata, () => {
  describe('having a handler and pipes', () => {
    describe('when called', () => {
      let parameterPipeListFixture: (ServiceIdentifier<Pipe> | Pipe)[];
      let handlerFixture: CustomNativeParameterDecoratorHandler;
      let result: unknown;

      beforeAll(() => {
        parameterPipeListFixture = [
          Symbol() as unknown as Pipe,
          Symbol() as unknown as Pipe,
        ];
        handlerFixture =
          Symbol() as unknown as CustomNativeParameterDecoratorHandler;

        result = buildCustomNativeControllerMethodParameterMetadata(
          parameterPipeListFixture,
          handlerFixture,
        );
      });

      it('should return expected result', () => {
        const expected: ControllerMethodParameterMetadata = {
          customParameterDecoratorHandler: handlerFixture,
          parameterName: undefined,
          parameterType: RequestMethodParameterType.CustomNative,
          pipeList: parameterPipeListFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having ServiceIdentifier pipes', () => {
    describe('when called', () => {
      let parameterPipeListFixture: (ServiceIdentifier<Pipe> | Pipe)[];
      let handlerFixture: CustomNativeParameterDecoratorHandler;
      let result: unknown;

      beforeAll(() => {
        parameterPipeListFixture = [
          Symbol() as ServiceIdentifier<Pipe>,
          'PipeClass' as ServiceIdentifier<Pipe>,
        ];
        handlerFixture =
          Symbol() as unknown as CustomNativeParameterDecoratorHandler;

        result = buildCustomNativeControllerMethodParameterMetadata(
          parameterPipeListFixture,
          handlerFixture,
        );
      });

      it('should return expected result', () => {
        const expected: ControllerMethodParameterMetadata = {
          customParameterDecoratorHandler: handlerFixture,
          parameterName: undefined,
          parameterType: RequestMethodParameterType.CustomNative,
          pipeList: parameterPipeListFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
