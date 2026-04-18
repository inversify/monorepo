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

vitest.mock(import('../buildHeaderParse.js'));
vitest.mock(import('./getHeaderParameterObjects.js'));

import { type OpenApi3Dot2Object } from '@inversifyjs/open-api-types/v3Dot2';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import type Ajv from 'ajv';
import { type ValidateFunction } from 'ajv';

import { type HeaderValidationInputParam } from '../../models/HeaderValidationInputParam.js';
import { type ValidationCacheEntry } from '../../models/v3Dot2/ValidationCacheEntry.js';
import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import { buildHeaderParse } from '../buildHeaderParse.js';
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

      const parseMock: Mock = vitest.fn().mockReturnValueOnce('abc-123');

      vitest.mocked(buildHeaderParse).mockReturnValueOnce(parseMock);

      const validateMock: ValidateFunction = Object.assign(
        vitest.fn().mockReturnValueOnce(true),
        { errors: null, schema: {} },
      ) as unknown as ValidateFunction;

      const ajvMock: Mocked<Ajv> = {
        getSchema: vitest.fn().mockReturnValueOnce(validateMock),
      } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

      const validationCacheEntry: ValidationCacheEntry = {
        body: new Map(),
        headers: undefined,
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

      const parseMock: Mock = vitest.fn();

      vitest.mocked(buildHeaderParse).mockReturnValueOnce(parseMock);

      const validateMock: ValidateFunction = Object.assign(vitest.fn(), {
        errors: null,
        schema: {},
      }) as unknown as ValidateFunction;

      const ajvMock: Mocked<Ajv> = {
        getSchema: vitest.fn().mockReturnValueOnce(validateMock),
      } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

      const validationCacheEntry: ValidationCacheEntry = {
        body: new Map(),
        headers: undefined,
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
      const expectedErrorProperties: Partial<InversifyValidationError> = {
        kind: InversifyValidationErrorKind.validationFailed,
        message: 'Missing required header: x-request-id',
      };

      expect(result).toBeInstanceOf(InversifyValidationError);
      expect(result).toMatchObject(expectedErrorProperties);
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

      const parseMock: Mock = vitest.fn();

      vitest.mocked(buildHeaderParse).mockReturnValueOnce(parseMock);

      const validateMock: ValidateFunction = Object.assign(vitest.fn(), {
        errors: null,
        schema: {},
      }) as unknown as ValidateFunction;

      const ajvMock: Mocked<Ajv> = {
        getSchema: vitest.fn().mockReturnValueOnce(validateMock),
      } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

      const validationCacheEntry: ValidationCacheEntry = {
        body: new Map(),
        headers: undefined,
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

    it('should return headers without the optional header', () => {
      expect(result).toStrictEqual({});
    });
  });

  describe('when called, and validation fails', () => {
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

      const parseMock: Mock = vitest.fn().mockReturnValueOnce('not-valid');

      vitest.mocked(buildHeaderParse).mockReturnValueOnce(parseMock);

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
        headers: undefined,
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
      const expectedErrorProperties: Partial<InversifyValidationError> = {
        kind: InversifyValidationErrorKind.validationFailed,
        message: expect.stringContaining('x-count'),
      };

      expect(result).toBeInstanceOf(InversifyValidationError);
      expect(result).toMatchObject(expectedErrorProperties);
    });
  });

  describe('when called, and cached headers are reused', () => {
    let result: unknown;
    let ajvMock: Mocked<Ajv>;

    beforeAll(() => {
      const parseMock: Mock = vitest.fn().mockReturnValueOnce('test');

      const validateMock: ValidateFunction = Object.assign(
        vitest.fn().mockReturnValueOnce(true),
        { errors: null, schema: {} },
      ) as unknown as ValidateFunction;

      ajvMock = {
        getSchema: vitest.fn(),
      } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

      const validationCacheEntry: ValidationCacheEntry = {
        body: new Map(),
        headers: new Map([
          [
            'x-request-id',
            {
              parse: parseMock,
              required: true,
              validate: validateMock,
            },
          ],
        ]),
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

    it('should not call getHeaderParameterObjects()', () => {
      expect(getHeaderParameterObjects).not.toHaveBeenCalled();
    });

    it('should return validated headers', () => {
      expect(result).toStrictEqual({ 'x-request-id': 'test' });
    });
  });
});
