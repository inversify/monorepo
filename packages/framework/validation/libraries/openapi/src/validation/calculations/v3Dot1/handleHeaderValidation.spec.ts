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
vitest.mock(import('../coerceHeaderValue.js'));
vitest.mock(import('../inferOpenApiSchemaTypes.js'));
vitest.mock(import('./getHeaderParameterObjects.js'));

import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import { type JsonSchemaType } from '@inversifyjs/json-schema-types/2020-12';
import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import type Ajv from 'ajv';
import { type ValidateFunction } from 'ajv';

import { type HeaderValidationInputParam } from '../../models/HeaderValidationInputParam.js';
import { SCHEMA_ID } from '../../models/v3Dot1/schemaId.js';
import { type ValidationCacheEntry } from '../../models/v3Dot1/ValidationCacheEntry.js';
import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import { type CoercionCandidate, coerceHeaderValue } from '../coerceHeaderValue.js';
import { inferOpenApiSchemaTypes } from '../inferOpenApiSchemaTypes.js';
import {
  type HeaderParameterEntry,
  getHeaderParameterObjects,
} from './getHeaderParameterObjects.js';
import { handleHeaderValidation } from './handleHeaderValidation.js';

describe(handleHeaderValidation, () => {
  let openApiObjectFixture: OpenApi3Dot1Object;
  let openApiResolverFixture: OpenApiResolver;

  beforeAll(() => {
    openApiObjectFixture = Symbol() as unknown as OpenApi3Dot1Object;
    openApiResolverFixture = Symbol() as unknown as OpenApiResolver;

    vitest
      .mocked(escapeJsonPointerFragments)
      .mockImplementation((...fragments: string[]) => fragments.join('/'));
  });

  afterAll(() => {
    vitest.restoreAllMocks();
  });

  describe('when called, and headers are valid with string type', () => {
    let result: unknown;

    beforeAll(() => {
      const headerParamMap: Map<string, HeaderParameterEntry> = new Map([
        [
          'x-request-id',
          {
            parameter: {
              in: 'header',
              name: 'X-Request-ID',
              required: true,
              schema: { type: 'string' },
            },
            pointerPrefix: 'paths/~1users/get/parameters/0',
          },
        ],
      ]);

      vitest
        .mocked(getHeaderParameterObjects)
        .mockReturnValueOnce(headerParamMap);

      const typesFixture: Set<JsonSchemaType> = new Set(['string']);

      vitest.mocked(inferOpenApiSchemaTypes).mockReturnValueOnce(typesFixture);

      const candidatesFixture: CoercionCandidate[] = [
        { coercedValue: 'abc-123', type: 'string' },
      ];

      vitest.mocked(coerceHeaderValue).mockReturnValueOnce(candidatesFixture);

      const validateMock: ValidateFunction = Object.assign(
        vitest.fn().mockReturnValueOnce(true),
        { errors: null, schema: {} },
      ) as unknown as ValidateFunction;

      const ajvMock: Mocked<Ajv> = {
        getSchema: vitest.fn().mockReturnValueOnce(validateMock),
      } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

      const validationCacheEntry: ValidationCacheEntry = {
        body: new Map(),
        headers: new Map(),
      };

      const getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      > = vitest.fn().mockReturnValueOnce(validationCacheEntry);

      const inputParam: HeaderValidationInputParam = {
        headers: { 'x-request-id': 'abc-123' },
        method: 'get',
        path: '/users',
        type: Symbol() as unknown as HeaderValidationInputParam['type'],
      };

      result = handleHeaderValidation(
        ajvMock,
        openApiObjectFixture,
        openApiResolverFixture,
        inputParam,
        getEntryMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return validated headers record', () => {
      expect(result).toStrictEqual({ 'x-request-id': 'abc-123' });
    });
  });

  describe('when called, and required header is missing', () => {
    let result: unknown;

    beforeAll(() => {
      const headerParamMap: Map<string, HeaderParameterEntry> = new Map([
        [
          'x-request-id',
          {
            parameter: {
              in: 'header',
              name: 'X-Request-ID',
              required: true,
              schema: { type: 'string' },
            },
            pointerPrefix: 'paths/~1users/get/parameters/0',
          },
        ],
      ]);

      vitest
        .mocked(getHeaderParameterObjects)
        .mockReturnValueOnce(headerParamMap);

      const ajvMock: Mocked<Ajv> = {
        getSchema: vitest.fn(),
      } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

      const validationCacheEntry: ValidationCacheEntry = {
        body: new Map(),
        headers: new Map(),
      };

      const getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      > = vitest.fn().mockReturnValueOnce(validationCacheEntry);

      const inputParam: HeaderValidationInputParam = {
        headers: {},
        method: 'get',
        path: '/users',
        type: Symbol() as unknown as HeaderValidationInputParam['type'],
      };

      try {
        handleHeaderValidation(
          ajvMock,
          openApiObjectFixture,
          openApiResolverFixture,
          inputParam,
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

    it('should throw with missing header message', () => {
      expect((result as InversifyValidationError).message).toBe(
        'Required header "X-Request-ID" is missing',
      );
    });
  });

  describe('when called, and optional header is absent', () => {
    let result: unknown;

    beforeAll(() => {
      const headerParamMap: Map<string, HeaderParameterEntry> = new Map([
        [
          'x-optional',
          {
            parameter: {
              in: 'header',
              name: 'X-Optional',
              schema: { type: 'string' },
            },
            pointerPrefix: 'paths/~1users/get/parameters/0',
          },
        ],
      ]);

      vitest
        .mocked(getHeaderParameterObjects)
        .mockReturnValueOnce(headerParamMap);

      const ajvMock: Mocked<Ajv> = {
        getSchema: vitest.fn(),
      } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

      const validationCacheEntry: ValidationCacheEntry = {
        body: new Map(),
        headers: new Map(),
      };

      const getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      > = vitest.fn().mockReturnValueOnce(validationCacheEntry);

      const inputParam: HeaderValidationInputParam = {
        headers: {},
        method: 'get',
        path: '/users',
        type: Symbol() as unknown as HeaderValidationInputParam['type'],
      };

      result = handleHeaderValidation(
        ajvMock,
        openApiObjectFixture,
        openApiResolverFixture,
        inputParam,
        getEntryMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return empty record', () => {
      expect(result).toStrictEqual({});
    });
  });

  describe('when called, and integer coercion succeeds', () => {
    let result: unknown;

    beforeAll(() => {
      const headerParamMap: Map<string, HeaderParameterEntry> = new Map([
        [
          'x-rate-limit',
          {
            parameter: {
              in: 'header',
              name: 'X-Rate-Limit',
              required: true,
              schema: { type: 'integer' },
            },
            pointerPrefix: 'paths/~1users/get/parameters/0',
          },
        ],
      ]);

      vitest
        .mocked(getHeaderParameterObjects)
        .mockReturnValueOnce(headerParamMap);

      vitest
        .mocked(inferOpenApiSchemaTypes)
        .mockReturnValueOnce(new Set(['integer']));

      vitest
        .mocked(coerceHeaderValue)
        .mockReturnValueOnce([{ coercedValue: 42, type: 'integer' }]);

      const validateMock: ValidateFunction = Object.assign(
        vitest.fn().mockReturnValueOnce(true),
        { errors: null, schema: {} },
      ) as unknown as ValidateFunction;

      const ajvMock: Mocked<Ajv> = {
        getSchema: vitest.fn().mockReturnValueOnce(validateMock),
      } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

      const validationCacheEntry: ValidationCacheEntry = {
        body: new Map(),
        headers: new Map(),
      };

      const getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      > = vitest.fn().mockReturnValueOnce(validationCacheEntry);

      const inputParam: HeaderValidationInputParam = {
        headers: { 'x-rate-limit': '42' },
        method: 'get',
        path: '/users',
        type: Symbol() as unknown as HeaderValidationInputParam['type'],
      };

      result = handleHeaderValidation(
        ajvMock,
        openApiObjectFixture,
        openApiResolverFixture,
        inputParam,
        getEntryMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return record with coerced value', () => {
      expect(result).toStrictEqual({ 'x-rate-limit': 42 });
    });
  });

  describe('when called, and validation fails for all candidates', () => {
    let result: unknown;

    beforeAll(() => {
      const headerParamMap: Map<string, HeaderParameterEntry> = new Map([
        [
          'x-count',
          {
            parameter: {
              in: 'header',
              name: 'X-Count',
              required: true,
              schema: { minimum: 1, type: 'integer' },
            },
            pointerPrefix: 'paths/~1users/get/parameters/0',
          },
        ],
      ]);

      vitest
        .mocked(getHeaderParameterObjects)
        .mockReturnValueOnce(headerParamMap);

      vitest
        .mocked(inferOpenApiSchemaTypes)
        .mockReturnValueOnce(new Set(['integer']));

      vitest.mocked(coerceHeaderValue).mockReturnValueOnce([]);

      const validateMock: ValidateFunction = Object.assign(
        vitest.fn().mockReturnValueOnce(false),
        {
          errors: [
            {
              instancePath: '',
              keyword: 'type',
              message: 'must be integer',
              params: {},
              schemaPath: '#/type',
            },
          ],
          schema: {},
        },
      ) as unknown as ValidateFunction;

      const ajvMock: Mocked<Ajv> = {
        getSchema: vitest.fn().mockReturnValueOnce(validateMock),
      } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

      const validationCacheEntry: ValidationCacheEntry = {
        body: new Map(),
        headers: new Map(),
      };

      const getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      > = vitest.fn().mockReturnValueOnce(validationCacheEntry);

      const inputParam: HeaderValidationInputParam = {
        headers: { 'x-count': 'not-valid' },
        method: 'get',
        path: '/users',
        type: Symbol() as unknown as HeaderValidationInputParam['type'],
      };

      try {
        handleHeaderValidation(
          ajvMock,
          openApiObjectFixture,
          openApiResolverFixture,
          inputParam,
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

    it('should throw with validation error message', () => {
      expect((result as InversifyValidationError).message).toContain(
        'Header "X-Count" validation failed',
      );
    });
  });

  describe('when called, and cached validator is reused', () => {
    let result: unknown;
    let ajvMock: Mocked<Ajv>;

    beforeAll(() => {
      const headerParamMap: Map<string, HeaderParameterEntry> = new Map([
        [
          'x-request-id',
          {
            parameter: {
              in: 'header',
              name: 'X-Request-ID',
              required: true,
              schema: { type: 'string' },
            },
            pointerPrefix: 'paths/~1users/get/parameters/0',
          },
        ],
      ]);

      vitest
        .mocked(getHeaderParameterObjects)
        .mockReturnValueOnce(headerParamMap);

      vitest
        .mocked(inferOpenApiSchemaTypes)
        .mockReturnValueOnce(new Set(['string']));

      vitest
        .mocked(coerceHeaderValue)
        .mockReturnValueOnce([{ coercedValue: 'test', type: 'string' }]);

      const validateMock: ValidateFunction = Object.assign(
        vitest.fn().mockReturnValueOnce(true),
        { errors: null, schema: {} },
      ) as unknown as ValidateFunction;

      ajvMock = {
        getSchema: vitest.fn(),
      } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

      const validationCacheEntry: ValidationCacheEntry = {
        body: new Map(),
        headers: new Map([['x-request-id', validateMock]]),
      };

      const getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      > = vitest.fn().mockReturnValueOnce(validationCacheEntry);

      const inputParam: HeaderValidationInputParam = {
        headers: { 'x-request-id': 'test' },
        method: 'get',
        path: '/users',
        type: Symbol() as unknown as HeaderValidationInputParam['type'],
      };

      result = handleHeaderValidation(
        ajvMock,
        openApiObjectFixture,
        openApiResolverFixture,
        inputParam,
        getEntryMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call ajv.getSchema()', () => {
      expect(ajvMock.getSchema).not.toHaveBeenCalled();
    });

    it('should return validated headers', () => {
      expect(result).toStrictEqual({ 'x-request-id': 'test' });
    });
  });
});
