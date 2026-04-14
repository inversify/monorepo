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

vitest.mock(import('../coerceHeaderValue.js'));
vitest.mock(import('../inferOpenApiSchemaTypes.js'));
vitest.mock(import('./getHeaderParameterObjects.js'));

import { type OpenApi3Dot2Object } from '@inversifyjs/open-api-types/v3Dot2';
import { InversifyValidationError } from '@inversifyjs/validation-common';
import type Ajv from 'ajv';
import { type ValidateFunction } from 'ajv';

import { type HeaderValidationInputParam } from '../../models/HeaderValidationInputParam.js';
import { type ValidationCacheEntry } from '../../models/v3Dot2/ValidationCacheEntry.js';
import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import { coerceHeaderValue } from '../coerceHeaderValue.js';
import { inferOpenApiSchemaTypes } from '../inferOpenApiSchemaTypes.js';
import {
  getHeaderParameterObjects,
  type HeaderParameterEntry,
} from './getHeaderParameterObjects.js';
import { handleHeaderValidation } from './handleHeaderValidation.js';

describe(handleHeaderValidation, () => {
  let openApiObjectFixture: OpenApi3Dot2Object;
  let openApiResolverFixture: OpenApiResolver;

  beforeAll(() => {
    openApiObjectFixture = Symbol() as unknown as OpenApi3Dot2Object;
    openApiResolverFixture = Symbol() as unknown as OpenApiResolver;
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

      vitest
        .mocked(inferOpenApiSchemaTypes)
        .mockReturnValueOnce(new Set(['string']));

      vitest
        .mocked(coerceHeaderValue)
        .mockReturnValueOnce([{ coercedValue: 'abc-123', type: 'string' }]);

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
});
