import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/http-core'));
vitest.mock(import('@inversifyjs/http-open-api'));
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
} from '@inversifyjs/http-open-api';
import {
  type OpenApi3Dot1Object,
  type OpenApi3Dot1OperationObject,
  type OpenApi3Dot1RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot1';
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

        pipe = new OpenApiValidationPipe({} as OpenApi3Dot1Object);

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

        pipe = new OpenApiValidationPipe({} as OpenApi3Dot1Object);

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

        pipe = new OpenApiValidationPipe({} as OpenApi3Dot1Object);

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

    describe('when called, and parameter is body with Validate marker and no OpenAPI metadata', () => {
      let pipe: OpenApiValidationPipe;
      let inputFixture: unknown;
      let metadataFixture: PipeMetadata;
      let requestBodyFixture: OpenApi3Dot1RequestBodyObject;
      let operationObjectFixture: OpenApi3Dot1OperationObject;

      let result: unknown;

      beforeAll(() => {
        inputFixture = { name: 'test' };
        metadataFixture = {
          methodName: 'create',
          parameterIndex: 0,
          targetClass: class {} as NewableFunction,
        };

        requestBodyFixture = {
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        };

        operationObjectFixture = {
          requestBody: requestBodyFixture,
        };

        pipe = new OpenApiValidationPipe({} as OpenApi3Dot1Object);

        vitest
          .mocked(getControllerMethodParameterMetadataList)
          .mockReturnValueOnce([
            {
              parameterType: RequestMethodParameterType.Body,
              pipeList: [],
            } as ControllerMethodParameterMetadata,
          ]);

        vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce([true]);

        // resolveContentType calls getControllerOpenApiMetadata
        vitest.mocked(getControllerOpenApiMetadata).mockReturnValueOnce({
          methodToOperationObjectMap: new Map([
            ['create', operationObjectFixture],
          ]),
        } as unknown as ControllerOpenApiMetadata);

        // execute calls getControllerOpenApiMetadata again
        vitest
          .mocked(getControllerOpenApiMetadata)
          .mockReturnValueOnce(undefined);

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
      let requestBodyFixture: OpenApi3Dot1RequestBodyObject;
      let operationObjectFixture: OpenApi3Dot1OperationObject;

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

        pipe = new OpenApiValidationPipe({} as OpenApi3Dot1Object);

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

    describe('when called, and content-type provider returns unsupported type', () => {
      let pipe: OpenApiValidationPipe;
      let inputFixture: unknown;
      let metadataFixture: PipeMetadata;
      let requestBodyFixture: OpenApi3Dot1RequestBodyObject;
      let operationObjectFixture: OpenApi3Dot1OperationObject;

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
          },
        };

        operationObjectFixture = {
          requestBody: requestBodyFixture,
        };

        pipe = new OpenApiValidationPipe(
          {} as OpenApi3Dot1Object,
          () => 'text/plain',
        );

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
