import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('@inversifyjs/json-schema-pointer'));
vitest.mock(import('./getOperationObject.js'));
vitest.mock(import('./getRequestBodyObject.js'));

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

import { InversifyOpenApiValidationError } from '../../../models/InversifyOpenApiValidationError.js';
import { type OpenApiRouter } from '../../../router/services/OpenApiRouter.js';
import { type BodyValidationInputParam } from '../../models/BodyValidationInputParam.js';
import { type OpenApiValidationContext } from '../../models/OpenApiValidationContext.js';
import { SCHEMA_ID } from '../../models/v3Dot1/schemaId.js';
import { type ValidationCacheEntry } from '../../models/v3Dot1/ValidationCacheEntry.js';
import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import { getOperationObject } from './getOperationObject.js';
import { getRequestBodyObject } from './getRequestBodyObject.js';
import { handleBodyValidation } from './handleBodyValidation.js';

describe(handleBodyValidation, () => {
  let openApiObjectFixture: OpenApi3Dot1Object;
  let validationContextFixture: OpenApiValidationContext;
  let openApiResolverFixture: OpenApiResolver;
  let openApiRouterMock: OpenApiRouter;

  beforeAll(() => {
    openApiObjectFixture = Symbol() as unknown as OpenApi3Dot1Object;
    openApiResolverFixture = Symbol() as unknown as OpenApiResolver;
    openApiRouterMock = {
      findRoute: vitest.fn(),
    };
    validationContextFixture = {
      resolver: openApiResolverFixture,
      router: openApiRouterMock,
    };
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
        method: methodFixture,
        path: pathFixture,
        type: Symbol() as unknown as BodyValidationInputParam<unknown>['type'],
      };
      operationObjectFixture =
        Symbol() as unknown as OpenApi3Dot1OperationObject;
      requestBodyObjectFixture = {
        content: {
          [contentTypeFixture]: {
            schema: {},
          },
        },
      };
      escapedPointerFixture = `paths/${pathFixture}/${methodFixture}/requestBody/content/${contentTypeFixture}/schema`;
    });

    describe('when called, and getEntry() returns empty entry and ajv.getSchema() returns undefined', () => {
      let ajvMock: Mocked<Ajv>;
      let getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      >;
      let validationCacheEntryFixture: ValidationCacheEntry;
      let schemaPointerFixture: string;
      let result: unknown;

      beforeAll(() => {
        ajvMock = {
          getSchema: vitest.fn().mockReturnValueOnce(undefined),
        } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

        schemaPointerFixture = `${SCHEMA_ID}#/${escapedPointerFixture}`;

        validationCacheEntryFixture = {
          body: undefined,
          headers: undefined,
          params: undefined,
          queries: undefined,
        };

        getEntryMock = vitest
          .fn<(path: string, method: string) => ValidationCacheEntry>()
          .mockReturnValueOnce(validationCacheEntryFixture);

        vitest
          .mocked(getOperationObject)
          .mockReturnValueOnce(operationObjectFixture);
        vitest
          .mocked(getRequestBodyObject)
          .mockReturnValueOnce(requestBodyObjectFixture);
        vitest
          .mocked(escapeJsonPointerFragments)
          .mockReturnValueOnce(escapedPointerFixture);

        vitest
          .mocked(openApiRouterMock.findRoute)
          .mockReturnValueOnce(pathFixture);

        try {
          handleBodyValidation(
            ajvMock,
            openApiObjectFixture,
            validationContextFixture,
            inputParamFixture,
            getEntryMock,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getEntry()', () => {
        expect(getEntryMock).toHaveBeenCalledExactlyOnceWith(
          pathFixture,
          methodFixture,
        );
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
          openApiResolverFixture,
          operationObjectFixture,
          methodFixture,
          pathFixture,
        );
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

    describe('when called, and getEntry() returns empty entry and validation succeeds', () => {
      let ajvMock: Mocked<Ajv>;
      let getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      >;
      let validationCacheEntryFixture: ValidationCacheEntry;
      let result: unknown;

      beforeAll(() => {
        const validateMock: ValidateFunction = Object.assign(
          vitest.fn().mockReturnValueOnce(true),
          { errors: null, schema: {} },
        ) as unknown as ValidateFunction;

        ajvMock = {
          getSchema: vitest.fn().mockReturnValueOnce(validateMock),
        } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

        validationCacheEntryFixture = {
          body: undefined,
          headers: undefined,
          params: undefined,
          queries: undefined,
        };

        getEntryMock = vitest
          .fn<(path: string, method: string) => ValidationCacheEntry>()
          .mockReturnValueOnce(validationCacheEntryFixture);

        vitest
          .mocked(getOperationObject)
          .mockReturnValueOnce(operationObjectFixture);
        vitest
          .mocked(getRequestBodyObject)
          .mockReturnValueOnce(requestBodyObjectFixture);
        vitest
          .mocked(escapeJsonPointerFragments)
          .mockReturnValueOnce(escapedPointerFixture);

        vitest
          .mocked(openApiRouterMock.findRoute)
          .mockReturnValueOnce(pathFixture);

        result = handleBodyValidation(
          ajvMock,
          openApiObjectFixture,
          validationContextFixture,
          inputParamFixture,
          getEntryMock,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getEntry()', () => {
        expect(getEntryMock).toHaveBeenCalledExactlyOnceWith(
          pathFixture,
          methodFixture,
        );
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
          openApiResolverFixture,
          operationObjectFixture,
          methodFixture,
          pathFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(inputParamFixture.body);
      });
    });

    describe('when called, and getEntry() returns empty entry and validation fails', () => {
      let ajvMock: Mocked<Ajv>;
      let getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      >;
      let validationCacheEntryFixture: ValidationCacheEntry;
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

        validationCacheEntryFixture = {
          body: undefined,
          headers: undefined,
          params: undefined,
          queries: undefined,
        };

        getEntryMock = vitest
          .fn<(path: string, method: string) => ValidationCacheEntry>()
          .mockReturnValueOnce(validationCacheEntryFixture);

        vitest
          .mocked(getOperationObject)
          .mockReturnValueOnce(operationObjectFixture);
        vitest
          .mocked(getRequestBodyObject)
          .mockReturnValueOnce(requestBodyObjectFixture);
        vitest
          .mocked(escapeJsonPointerFragments)
          .mockReturnValueOnce(escapedPointerFixture);

        vitest
          .mocked(openApiRouterMock.findRoute)
          .mockReturnValueOnce(pathFixture);

        try {
          handleBodyValidation(
            ajvMock,
            openApiObjectFixture,
            validationContextFixture,
            inputParamFixture,
            getEntryMock,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an InversifyOpenApiValidationError', () => {
        const expectedErrorProperties: Partial<InversifyOpenApiValidationError> =
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
            kind: InversifyValidationErrorKind.validationFailed,
            message:
              '[schema: #/properties/name/type, instance: /name]: "must be string"',
          };

        expect(result).toBeInstanceOf(InversifyOpenApiValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having an inputParam with no contentType', () => {
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
        contentType: undefined,
        method: methodFixture,
        path: pathFixture,
        type: Symbol() as unknown as BodyValidationInputParam<unknown>['type'],
      };
      operationObjectFixture =
        Symbol() as unknown as OpenApi3Dot1OperationObject;
      requestBodyObjectFixture = {
        content: {
          [contentTypeFixture]: {
            schema: {},
          },
        },
      };
      escapedPointerFixture = `paths/${pathFixture}/${methodFixture}/requestBody/content/${contentTypeFixture}/schema`;
    });

    describe('when called, and getEntry() returns empty entry and validation succeeds', () => {
      let ajvMock: Mocked<Ajv>;
      let getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      >;
      let validationCacheEntryFixture: ValidationCacheEntry;
      let result: unknown;

      beforeAll(() => {
        const validateMock: ValidateFunction = Object.assign(
          vitest.fn().mockReturnValueOnce(true),
          { errors: null, schema: {} },
        ) as unknown as ValidateFunction;

        ajvMock = {
          getSchema: vitest.fn().mockReturnValueOnce(validateMock),
        } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

        validationCacheEntryFixture = {
          body: undefined,
          headers: undefined,
          params: undefined,
          queries: undefined,
        };

        getEntryMock = vitest
          .fn<(path: string, method: string) => ValidationCacheEntry>()
          .mockReturnValueOnce(validationCacheEntryFixture);

        vitest
          .mocked(getOperationObject)
          .mockReturnValueOnce(operationObjectFixture);
        vitest
          .mocked(getRequestBodyObject)
          .mockReturnValueOnce(requestBodyObjectFixture);
        vitest
          .mocked(escapeJsonPointerFragments)
          .mockReturnValueOnce(escapedPointerFixture);

        vitest
          .mocked(openApiRouterMock.findRoute)
          .mockReturnValueOnce(pathFixture);

        result = handleBodyValidation(
          ajvMock,
          openApiObjectFixture,
          validationContextFixture,
          inputParamFixture,
          getEntryMock,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
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

      it('should return expected result', () => {
        expect(result).toBe(inputParamFixture.body);
      });
    });
  });

  describe('having an inputParam with undefined body and optional request body', () => {
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
        body: undefined,
        contentType: contentTypeFixture,
        method: methodFixture,
        path: pathFixture,
        type: Symbol() as unknown as BodyValidationInputParam<unknown>['type'],
      };
      operationObjectFixture =
        Symbol() as unknown as OpenApi3Dot1OperationObject;
      requestBodyObjectFixture = {
        content: {
          [contentTypeFixture]: {
            schema: {},
          },
        },
      };
      escapedPointerFixture = `paths/${pathFixture}/${methodFixture}/requestBody/content/${contentTypeFixture}/schema`;
    });

    describe('when called, and getEntry() returns empty entry', () => {
      let ajvMock: Mocked<Ajv>;
      let getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      >;
      let validationCacheEntryFixture: ValidationCacheEntry;
      let result: unknown;

      beforeAll(() => {
        const validateMock: ValidateFunction = Object.assign(vitest.fn(), {
          errors: null,
          schema: {},
        }) as unknown as ValidateFunction;

        ajvMock = {
          getSchema: vitest.fn().mockReturnValueOnce(validateMock),
        } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

        validationCacheEntryFixture = {
          body: undefined,
          headers: undefined,
          params: undefined,
          queries: undefined,
        };

        getEntryMock = vitest
          .fn<(path: string, method: string) => ValidationCacheEntry>()
          .mockReturnValueOnce(validationCacheEntryFixture);

        vitest
          .mocked(getOperationObject)
          .mockReturnValueOnce(operationObjectFixture);
        vitest
          .mocked(getRequestBodyObject)
          .mockReturnValueOnce(requestBodyObjectFixture);
        vitest
          .mocked(escapeJsonPointerFragments)
          .mockReturnValueOnce(escapedPointerFixture);

        vitest
          .mocked(openApiRouterMock.findRoute)
          .mockReturnValueOnce(pathFixture);

        result = handleBodyValidation(
          ajvMock,
          openApiObjectFixture,
          validationContextFixture,
          inputParamFixture,
          getEntryMock,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having an inputParam with contentType and an operationObject whose requestBody is a Reference Object', () => {
    let inputParamFixture: BodyValidationInputParam<unknown>;
    let pathFixture: string;
    let methodFixture: string;
    let contentTypeFixture: string;
    let operationObjectFixture: OpenApi3Dot1OperationObject;
    let requestBodyObjectFixture: OpenApi3Dot1RequestBodyObject;
    let requestBodyReferenceFixture: { $ref: string };
    let escapedPointerFixture: string;

    beforeAll(() => {
      pathFixture = '/users';
      methodFixture = 'post';
      contentTypeFixture = 'application/json';
      inputParamFixture = {
        body: { name: 'test' },
        contentType: contentTypeFixture,
        method: methodFixture,
        path: pathFixture,
        type: Symbol() as unknown as BodyValidationInputParam<unknown>['type'],
      };
      requestBodyReferenceFixture = {
        $ref: '#/components/requestBodies/UserBody',
      };
      operationObjectFixture = {
        requestBody: requestBodyReferenceFixture,
        responses: {},
      };
      requestBodyObjectFixture = {
        content: {
          [contentTypeFixture]: {
            schema: {},
          },
        },
      };
      escapedPointerFixture = `paths/${pathFixture}/${methodFixture}/requestBody/content/${contentTypeFixture}/schema`;
    });

    describe('when called, and getEntry() returns empty entry and ajv.getSchema() returns undefined', () => {
      let ajvMock: Mocked<Ajv>;
      let getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      >;
      let validationCacheEntryFixture: ValidationCacheEntry;
      let schemaPointerFixture: string;
      let result: unknown;

      beforeAll(() => {
        ajvMock = {
          getSchema: vitest.fn().mockReturnValueOnce(undefined),
        } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

        schemaPointerFixture = `${SCHEMA_ID}#/${escapedPointerFixture}`;

        validationCacheEntryFixture = {
          body: undefined,
          headers: undefined,
          params: undefined,
          queries: undefined,
        };

        getEntryMock = vitest
          .fn<(path: string, method: string) => ValidationCacheEntry>()
          .mockReturnValueOnce(validationCacheEntryFixture);

        vitest
          .mocked(getOperationObject)
          .mockReturnValueOnce(operationObjectFixture);
        vitest
          .mocked(getRequestBodyObject)
          .mockReturnValueOnce(requestBodyObjectFixture);
        vitest
          .mocked(escapeJsonPointerFragments)
          .mockReturnValueOnce(escapedPointerFixture);

        vitest
          .mocked(openApiRouterMock.findRoute)
          .mockReturnValueOnce(pathFixture);

        try {
          handleBodyValidation(
            ajvMock,
            openApiObjectFixture,
            validationContextFixture,
            inputParamFixture,
            getEntryMock,
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

      it('should throw an error with expected message', () => {
        expect((result as InversifyValidationError).message).toBe(
          `Unable to find schema for pointer: ${schemaPointerFixture}. The operation requestBody is an OpenAPI Reference Object ($ref: "${requestBodyReferenceFixture.$ref}"); AJV looks up this pointer on the document and does not follow OpenAPI $ref`,
        );
      });
    });
  });
});
