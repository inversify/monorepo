import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('@inversifyjs/json-schema-pointer'));
vitest.mock(import('../getPath.js'));
vitest.mock(import('./getOperationObject.js'));
vitest.mock(import('./getRequestBodyObject.js'));
vitest.mock(import('./inferContentType.js'));

import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import {
  type OpenApi3Dot1Object,
  type OpenApi3Dot1OperationObject,
  type OpenApi3Dot1RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import type Ajv from 'ajv';
import { type ValidateFunction } from 'ajv';

import { type BodyValidationInputParam } from '../../models/BodyValidationInputParam.js';
import { SCHEMA_ID } from '../../models/v3Dot1/schemaId.js';
import { getPath } from '../getPath.js';
import { getOperationObject } from './getOperationObject.js';
import { getRequestBodyObject } from './getRequestBodyObject.js';
import { handleBodyValidation } from './handleBodyValidation.js';
import { inferContentType } from './inferContentType.js';

describe(handleBodyValidation, () => {
  let openApiObjectFixture: OpenApi3Dot1Object;

  beforeAll(() => {
    openApiObjectFixture = Symbol() as unknown as OpenApi3Dot1Object;
  });

  describe('having an inputParam with contentType', () => {
    let inputParamFixture: BodyValidationInputParam<unknown>;
    let pathFixture: string;
    let methodFixture: string;
    let contentTypeFixture: string;
    let operationObjectFixture: OpenApi3Dot1OperationObject;
    let requestBodyObjectFixture: OpenApi3Dot1RequestBodyObject;
    let escapedPointerFixture: string;

    beforeAll(() => {
      pathFixture = '/users';
      methodFixture = 'post';
      contentTypeFixture = 'application/json';
      inputParamFixture = {
        body: { name: 'test' },
        contentType: contentTypeFixture,
        method: 'POST',
        type: Symbol() as unknown as BodyValidationInputParam<unknown>['type'],
        url: '/users?page=1',
      };
      operationObjectFixture =
        Symbol() as unknown as OpenApi3Dot1OperationObject;
      requestBodyObjectFixture =
        Symbol() as unknown as OpenApi3Dot1RequestBodyObject;
      escapedPointerFixture = `paths/${pathFixture}/${methodFixture}/requestBody/content/${contentTypeFixture}/schema`;
    });

    describe('when called, and ajv.getSchema() returns undefined', () => {
      let ajvMock: Mocked<Ajv>;
      let schemaPointerFixture: string;
      let result: unknown;

      beforeAll(() => {
        ajvMock = {
          getSchema: vitest.fn().mockReturnValueOnce(undefined),
        } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

        schemaPointerFixture = `${SCHEMA_ID}#/${escapedPointerFixture}`;

        vitest.mocked(getPath).mockReturnValueOnce(pathFixture);
        vitest
          .mocked(getOperationObject)
          .mockReturnValueOnce(operationObjectFixture);
        vitest
          .mocked(getRequestBodyObject)
          .mockReturnValueOnce(requestBodyObjectFixture);
        vitest
          .mocked(escapeJsonPointerFragments)
          .mockReturnValueOnce(escapedPointerFixture);

        try {
          handleBodyValidation(
            ajvMock,
            openApiObjectFixture,
            inputParamFixture,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getPath()', () => {
        expect(getPath).toHaveBeenCalledExactlyOnceWith(inputParamFixture.url);
      });

      it('should call getOperationObject()', () => {
        expect(getOperationObject).toHaveBeenCalledExactlyOnceWith(
          openApiObjectFixture,
          methodFixture,
          pathFixture,
        );
      });

      it('should call getRequestBodyObject()', () => {
        expect(getRequestBodyObject).toHaveBeenCalledExactlyOnceWith(
          openApiObjectFixture,
          operationObjectFixture,
          methodFixture,
          pathFixture,
        );
      });

      it('should not call inferContentType()', () => {
        expect(inferContentType).not.toHaveBeenCalled();
      });

      it('should call escapeJsonPointerFragments()', () => {
        expect(escapeJsonPointerFragments).toHaveBeenCalledExactlyOnceWith(
          'paths',
          pathFixture,
          methodFixture,
          'requestBody',
          'content',
          contentTypeFixture,
          'schema',
        );
      });

      it('should call ajv.getSchema()', () => {
        expect(ajvMock.getSchema).toHaveBeenCalledExactlyOnceWith(
          schemaPointerFixture,
        );
      });

      it('should throw an InversifyValidationError', () => {
        expect(result).toBeInstanceOf(InversifyValidationError);
      });

      it('should throw an error with expected message', () => {
        expect((result as InversifyValidationError).message).toBe(
          `Unable to find schema for pointer: ${schemaPointerFixture}`,
        );
      });
    });

    describe('when called, and validation succeeds', () => {
      let ajvMock: Mocked<Ajv>;
      let result: unknown;

      beforeAll(() => {
        const validateMock: ValidateFunction = Object.assign(
          vitest.fn().mockReturnValueOnce(true),
          { errors: null, schema: {} },
        ) as unknown as ValidateFunction;

        ajvMock = {
          getSchema: vitest.fn().mockReturnValueOnce(validateMock),
        } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

        vitest.mocked(getPath).mockReturnValueOnce(pathFixture);
        vitest
          .mocked(getOperationObject)
          .mockReturnValueOnce(operationObjectFixture);
        vitest
          .mocked(getRequestBodyObject)
          .mockReturnValueOnce(requestBodyObjectFixture);
        vitest
          .mocked(escapeJsonPointerFragments)
          .mockReturnValueOnce(escapedPointerFixture);

        result = handleBodyValidation(
          ajvMock,
          openApiObjectFixture,
          inputParamFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getPath()', () => {
        expect(getPath).toHaveBeenCalledExactlyOnceWith(inputParamFixture.url);
      });

      it('should call getOperationObject()', () => {
        expect(getOperationObject).toHaveBeenCalledExactlyOnceWith(
          openApiObjectFixture,
          methodFixture,
          pathFixture,
        );
      });

      it('should call getRequestBodyObject()', () => {
        expect(getRequestBodyObject).toHaveBeenCalledExactlyOnceWith(
          openApiObjectFixture,
          operationObjectFixture,
          methodFixture,
          pathFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(inputParamFixture.body);
      });
    });

    describe('when called, and validation fails', () => {
      let ajvMock: Mocked<Ajv>;
      let result: unknown;

      beforeAll(() => {
        const validateMock: ValidateFunction = Object.assign(
          vitest.fn().mockReturnValueOnce(false),
          {
            errors: [
              {
                instancePath: '/name',
                keyword: 'type',
                message: 'must be string',
                params: {},
                schemaPath: '#/properties/name/type',
              },
            ],
            schema: {},
          },
        ) as unknown as ValidateFunction;

        ajvMock = {
          getSchema: vitest.fn().mockReturnValueOnce(validateMock),
        } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

        vitest.mocked(getPath).mockReturnValueOnce(pathFixture);
        vitest
          .mocked(getOperationObject)
          .mockReturnValueOnce(operationObjectFixture);
        vitest
          .mocked(getRequestBodyObject)
          .mockReturnValueOnce(requestBodyObjectFixture);
        vitest
          .mocked(escapeJsonPointerFragments)
          .mockReturnValueOnce(escapedPointerFixture);

        try {
          handleBodyValidation(
            ajvMock,
            openApiObjectFixture,
            inputParamFixture,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an InversifyValidationError', () => {
        expect(result).toBeInstanceOf(InversifyValidationError);
      });

      it('should throw an error with validationFailed kind', () => {
        expect((result as InversifyValidationError).kind).toBe(
          InversifyValidationErrorKind.validationFailed,
        );
      });

      it('should throw an error with expected message', () => {
        expect((result as InversifyValidationError).message).toBe(
          '[schema: #/properties/name/type, instance: /name]: "must be string"',
        );
      });
    });
  });

  describe('having an inputParam with no contentType', () => {
    let inputParamFixture: BodyValidationInputParam<unknown>;
    let pathFixture: string;
    let methodFixture: string;
    let inferredContentTypeFixture: string;
    let operationObjectFixture: OpenApi3Dot1OperationObject;
    let requestBodyObjectFixture: OpenApi3Dot1RequestBodyObject;
    let escapedPointerFixture: string;

    beforeAll(() => {
      pathFixture = '/users';
      methodFixture = 'post';
      inferredContentTypeFixture = 'application/json';
      inputParamFixture = {
        body: { name: 'test' },
        contentType: undefined,
        method: 'POST',
        type: Symbol() as unknown as BodyValidationInputParam<unknown>['type'],
        url: '/users',
      };
      operationObjectFixture =
        Symbol() as unknown as OpenApi3Dot1OperationObject;
      requestBodyObjectFixture =
        Symbol() as unknown as OpenApi3Dot1RequestBodyObject;
      escapedPointerFixture = `paths/${pathFixture}/${methodFixture}/requestBody/content/${inferredContentTypeFixture}/schema`;
    });

    describe('when called, and validation succeeds', () => {
      let ajvMock: Mocked<Ajv>;
      let result: unknown;

      beforeAll(() => {
        const validateMock: ValidateFunction = Object.assign(
          vitest.fn().mockReturnValueOnce(true),
          { errors: null, schema: {} },
        ) as unknown as ValidateFunction;

        ajvMock = {
          getSchema: vitest.fn().mockReturnValueOnce(validateMock),
        } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

        vitest.mocked(getPath).mockReturnValueOnce(pathFixture);
        vitest
          .mocked(getOperationObject)
          .mockReturnValueOnce(operationObjectFixture);
        vitest
          .mocked(getRequestBodyObject)
          .mockReturnValueOnce(requestBodyObjectFixture);
        vitest
          .mocked(inferContentType)
          .mockReturnValueOnce(inferredContentTypeFixture);
        vitest
          .mocked(escapeJsonPointerFragments)
          .mockReturnValueOnce(escapedPointerFixture);

        result = handleBodyValidation(
          ajvMock,
          openApiObjectFixture,
          inputParamFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call inferContentType()', () => {
        expect(inferContentType).toHaveBeenCalledExactlyOnceWith(
          requestBodyObjectFixture,
          methodFixture,
        );
      });

      it('should call escapeJsonPointerFragments()', () => {
        expect(escapeJsonPointerFragments).toHaveBeenCalledExactlyOnceWith(
          'paths',
          pathFixture,
          methodFixture,
          'requestBody',
          'content',
          inferredContentTypeFixture,
          'schema',
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(inputParamFixture.body);
      });
    });
  });
});
