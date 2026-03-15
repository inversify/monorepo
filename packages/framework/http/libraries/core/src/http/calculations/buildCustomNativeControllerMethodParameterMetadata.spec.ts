import { beforeAll, describe, expect, it } from 'vitest';

import { type Pipe } from '@inversifyjs/framework-core';
import { type ServiceIdentifier } from 'inversify';

import { type ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata.js';
import { type CustomNativeParameterDecoratorHandler } from '../models/CustomNativeParameterDecoratorHandler.js';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType.js';
import { buildCustomNativeControllerMethodParameterMetadata } from './buildCustomNativeControllerMethodParameterMetadata.js';

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
