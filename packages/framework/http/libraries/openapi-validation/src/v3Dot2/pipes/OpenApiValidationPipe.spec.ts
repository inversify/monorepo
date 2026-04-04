import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/http-core'));
vitest.mock(import('@inversifyjs/http-open-api/v3Dot2'));
vitest.mock(import('@inversifyjs/json-schema-pointer'));
vitest.mock(import('@inversifyjs/reflect-metadata-utils'));

import { type PipeMetadata } from '@inversifyjs/framework-core';
import {
  type ControllerMethodParameterMetadata,
  getControllerMethodParameterMetadataList,
  RequestMethodParameterType,
} from '@inversifyjs/http-core';
import {
  type ControllerOpenApiMetadata,
  getControllerOpenApiMetadata,
} from '@inversifyjs/http-open-api/v3Dot2';
import {
  type OpenApi3Dot2Object,
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot2';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { InversifyValidationError } from '@inversifyjs/validation-common';

import { OpenApiValidationPipe } from './OpenApiValidationPipe.js';

describe(OpenApiValidationPipe, () => {
  describe('.execute', () => {
    describe('when called, and parameter metadata is undefined', () => {
      let pipe: OpenApiValidationPipe;
      let inputFixture: unknown;
      let metadataFixture: PipeMetadata;
      let result: unknown;

      beforeAll(() => {
        inputFixture = { name: 'test' };
        metadataFixture = {
          methodName: 'create',
          parameterIndex: 0,
          targetClass: class {} as NewableFunction,
        };

        pipe = new OpenApiValidationPipe({} as OpenApi3Dot2Object);

        vitest
          .mocked(getControllerMethodParameterMetadataList)
          .mockReturnValueOnce([]);

        result = pipe.execute(inputFixture, metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return input unchanged', () => {
        expect(result).toBe(inputFixture);
      });
    });

    describe('when called, and parameter is not a body', () => {
      let pipe: OpenApiValidationPipe;
      let inputFixture: unknown;
      let metadataFixture: PipeMetadata;
      let result: unknown;

      beforeAll(() => {
        inputFixture = { name: 'test' };
        metadataFixture = {
          methodName: 'create',
          parameterIndex: 0,
          targetClass: class {} as NewableFunction,
        };

        pipe = new OpenApiValidationPipe({} as OpenApi3Dot2Object);

        vitest
          .mocked(getControllerMethodParameterMetadataList)
          .mockReturnValueOnce([
            {
              parameterType: RequestMethodParameterType.Query,
              pipeList: [],
            } as ControllerMethodParameterMetadata,
          ]);

        result = pipe.execute(inputFixture, metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return input unchanged', () => {
        expect(result).toBe(inputFixture);
      });
    });

    describe('when called, and parameter is body without Validate marker', () => {
      let pipe: OpenApiValidationPipe;
      let inputFixture: unknown;
      let metadataFixture: PipeMetadata;
      let result: unknown;

      beforeAll(() => {
        inputFixture = { name: 'test' };
        metadataFixture = {
          methodName: 'create',
          parameterIndex: 0,
          targetClass: class {} as NewableFunction,
        };

        pipe = new OpenApiValidationPipe({} as OpenApi3Dot2Object);

        vitest
          .mocked(getControllerMethodParameterMetadataList)
          .mockReturnValueOnce([
            {
              parameterType: RequestMethodParameterType.Body,
              pipeList: [],
            } as ControllerMethodParameterMetadata,
          ]);

        vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce(undefined);

        result = pipe.execute(inputFixture, metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return input unchanged', () => {
        expect(result).toBe(inputFixture);
      });
    });

    describe('when called, and content-type cannot be determined (multiple types, no provider)', () => {
      let pipe: OpenApiValidationPipe;
      let inputFixture: unknown;
      let metadataFixture: PipeMetadata;
      let requestBodyFixture: OpenApi3Dot2RequestBodyObject;
      let operationObjectFixture: OpenApi3Dot2OperationObject;

      beforeAll(() => {
        inputFixture = { name: 'test' };
        metadataFixture = {
          methodName: 'create',
          parameterIndex: 0,
          targetClass: class {} as NewableFunction,
        };

        requestBodyFixture = {
          content: {
            'application/json': { schema: { type: 'object' } },
            'application/xml': { schema: { type: 'object' } },
          },
        };

        operationObjectFixture = {
          requestBody: requestBodyFixture,
        };

        pipe = new OpenApiValidationPipe({} as OpenApi3Dot2Object);

        vitest
          .mocked(getControllerMethodParameterMetadataList)
          .mockReturnValueOnce([
            {
              parameterType: RequestMethodParameterType.Body,
              pipeList: [],
            } as ControllerMethodParameterMetadata,
          ]);

        vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce([true]);

        vitest.mocked(getControllerOpenApiMetadata).mockReturnValueOnce({
          methodToOperationObjectMap: new Map([
            ['create', operationObjectFixture],
          ]),
        } as unknown as ControllerOpenApiMetadata);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw InversifyValidationError', () => {
        expect(() => pipe.execute(inputFixture, metadataFixture)).toThrow(
          InversifyValidationError,
        );
      });
    });
  });
});
