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

vitest.mock(import('../buildQueryParse.js'));
vitest.mock(import('./getQueryParameterObjects.js'));

import { type OpenApi3Dot2Object } from '@inversifyjs/open-api-types/v3Dot2';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import type Ajv from 'ajv';
import { type ValidateFunction } from 'ajv';

import { type OpenApiRouter } from '../../../router/services/OpenApiRouter.js';
import { type OpenApiValidationContext } from '../../models/OpenApiValidationContext.js';
import { type QueryValidationInputParam } from '../../models/QueryValidationInputParam.js';
import { type ValidationCacheEntry } from '../../models/v3Dot2/ValidationCacheEntry.js';
import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import { buildQueryParse } from '../buildQueryParse.js';
import {
  getQueryParameterObjects,
  type QueryParameterEntry,
} from './getQueryParameterObjects.js';
import { handleQueryValidation } from './handleQueryValidation.js';

describe(handleQueryValidation, () => {
  let openApiObjectFixture: OpenApi3Dot2Object;
  let validationContextFixture: OpenApiValidationContext;
  let openApiResolverFixture: OpenApiResolver;
  let openApiRouterMock: OpenApiRouter;

  beforeAll(() => {
    openApiObjectFixture = Symbol() as unknown as OpenApi3Dot2Object;
    openApiResolverFixture = Symbol() as unknown as OpenApiResolver;
    openApiRouterMock = {
      findRoute: vitest.fn(),
    };
    validationContextFixture = {
      resolver: openApiResolverFixture,
      router: openApiRouterMock,
    };
  });

  afterAll(() => {
    vitest.restoreAllMocks();
  });

  describe('when called, and route is not found', () => {
    let result: unknown;

    beforeAll(() => {
      vitest.mocked(openApiRouterMock.findRoute).mockReturnValueOnce(undefined);

      const ajvMock: Mocked<Ajv> = {
        getSchema: vitest.fn(),
      } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

      const getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      > = vitest.fn();

      const inputParam: QueryValidationInputParam = {
        method: 'get',
        path: '/unknown',
        queries: {},
        type: Symbol() as unknown as QueryValidationInputParam['type'],
      };

      try {
        handleQueryValidation(
          ajvMock,
          openApiObjectFixture,
          validationContextFixture,
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
        message: expect.stringContaining('GET /unknown'),
      };

      expect(result).toBeInstanceOf(InversifyValidationError);
      expect(result).toMatchObject(expectedErrorProperties);
    });
  });

  describe('when called, and queries are valid', () => {
    let result: unknown;

    beforeAll(() => {
      const queryParamMap: Map<string, QueryParameterEntry> = new Map([
        [
          'page',
          {
            parameter: {
              in: 'query',
              name: 'page',
              required: false,
              schema: { type: 'integer' },
            },
            pointerPrefix: 'paths/~1items/get/parameters/0',
          },
        ],
      ]);

      vitest
        .mocked(getQueryParameterObjects)
        .mockReturnValueOnce(queryParamMap);

      const parseMock: Mock = vitest.fn().mockReturnValueOnce(10);

      vitest.mocked(buildQueryParse).mockReturnValueOnce(parseMock);

      const validateMock: ValidateFunction = Object.assign(
        vitest.fn().mockReturnValueOnce(true),
        { errors: null, schema: {} },
      ) as unknown as ValidateFunction;

      const ajvMock: Mocked<Ajv> = {
        getSchema: vitest.fn().mockReturnValueOnce(validateMock),
      } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

      const validationCacheEntry: ValidationCacheEntry = {
        body: undefined,
        headers: undefined,
        params: undefined,
        queries: undefined,
      };

      const getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      > = vitest.fn().mockReturnValueOnce(validationCacheEntry);

      const inputParam: QueryValidationInputParam = {
        method: 'get',
        path: '/items',
        queries: { page: '1' },
        type: Symbol() as unknown as QueryValidationInputParam['type'],
      };

      vitest
        .mocked(openApiRouterMock.findRoute)
        .mockReturnValueOnce(inputParam.path);

      result = handleQueryValidation(
        ajvMock,
        openApiObjectFixture,
        validationContextFixture,
        inputParam,
        getEntryMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return the computed queries record', () => {
      expect(result).toStrictEqual({ page: 10 });
    });
  });

  describe('when called, and required query is missing', () => {
    let result: unknown;

    beforeAll(() => {
      const queryParamMap: Map<string, QueryParameterEntry> = new Map([
        [
          'search',
          {
            parameter: {
              in: 'query',
              name: 'search',
              required: true,
              schema: { type: 'string' },
            },
            pointerPrefix: 'paths/~1items/get/parameters/0',
          },
        ],
      ]);

      vitest
        .mocked(getQueryParameterObjects)
        .mockReturnValueOnce(queryParamMap);

      const parseMock: Mock = vitest.fn();

      vitest.mocked(buildQueryParse).mockReturnValueOnce(parseMock);

      const validateMock: ValidateFunction = Object.assign(vitest.fn(), {
        errors: null,
        schema: {},
      }) as unknown as ValidateFunction;

      const ajvMock: Mocked<Ajv> = {
        getSchema: vitest.fn().mockReturnValueOnce(validateMock),
      } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

      const validationCacheEntry: ValidationCacheEntry = {
        body: undefined,
        headers: undefined,
        params: undefined,
        queries: undefined,
      };

      const getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      > = vitest.fn().mockReturnValueOnce(validationCacheEntry);

      const inputParam: QueryValidationInputParam = {
        method: 'get',
        path: '/items',
        queries: {},
        type: Symbol() as unknown as QueryValidationInputParam['type'],
      };

      try {
        vitest
          .mocked(openApiRouterMock.findRoute)
          .mockReturnValueOnce(inputParam.path);

        handleQueryValidation(
          ajvMock,
          openApiObjectFixture,
          validationContextFixture,
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
        message: 'Missing required query: search',
      };

      expect(result).toBeInstanceOf(InversifyValidationError);
      expect(result).toMatchObject(expectedErrorProperties);
    });
  });

  describe('when called, and query validation fails', () => {
    let result: unknown;

    beforeAll(() => {
      const queryParamMap: Map<string, QueryParameterEntry> = new Map([
        [
          'limit',
          {
            parameter: {
              in: 'query',
              name: 'limit',
              required: false,
              schema: { minimum: 1, type: 'integer' },
            },
            pointerPrefix: 'paths/~1items/get/parameters/0',
          },
        ],
      ]);

      vitest
        .mocked(getQueryParameterObjects)
        .mockReturnValueOnce(queryParamMap);

      const parseMock: Mock = vitest.fn().mockReturnValueOnce('not-a-number');

      vitest.mocked(buildQueryParse).mockReturnValueOnce(parseMock);

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
        body: undefined,
        headers: undefined,
        params: undefined,
        queries: undefined,
      };

      const getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      > = vitest.fn().mockReturnValueOnce(validationCacheEntry);

      const inputParam: QueryValidationInputParam = {
        method: 'get',
        path: '/items',
        queries: { limit: 'not-a-number' },
        type: Symbol() as unknown as QueryValidationInputParam['type'],
      };

      try {
        vitest
          .mocked(openApiRouterMock.findRoute)
          .mockReturnValueOnce(inputParam.path);

        handleQueryValidation(
          ajvMock,
          openApiObjectFixture,
          validationContextFixture,
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
        message: expect.stringContaining('limit'),
      };

      expect(result).toBeInstanceOf(InversifyValidationError);
      expect(result).toMatchObject(expectedErrorProperties);
    });
  });

  describe('when called, and cached queries are reused', () => {
    let result: unknown;
    let ajvMock: Mocked<Ajv>;

    beforeAll(() => {
      const parseMock: Mock = vitest.fn().mockReturnValueOnce('foo');

      const validateMock: ValidateFunction = Object.assign(
        vitest.fn().mockReturnValueOnce(true),
        { errors: null, schema: {} },
      ) as unknown as ValidateFunction;

      ajvMock = {
        getSchema: vitest.fn(),
      } as Partial<Mocked<Ajv>> as Mocked<Ajv>;

      const validationCacheEntry: ValidationCacheEntry = {
        body: undefined,
        headers: undefined,
        params: undefined,
        queries: new Map([
          [
            'search',
            {
              parse: parseMock,
              required: false,
              validate: validateMock,
            },
          ],
        ]),
      };

      const getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      > = vitest.fn().mockReturnValueOnce(validationCacheEntry);

      const inputParam: QueryValidationInputParam = {
        method: 'get',
        path: '/items',
        queries: { search: 'foo' },
        type: Symbol() as unknown as QueryValidationInputParam['type'],
      };

      vitest
        .mocked(openApiRouterMock.findRoute)
        .mockReturnValueOnce(inputParam.path);

      result = handleQueryValidation(
        ajvMock,
        openApiObjectFixture,
        validationContextFixture,
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

    it('should not call getQueryParameterObjects()', () => {
      expect(getQueryParameterObjects).not.toHaveBeenCalled();
    });

    it('should return the computed queries', () => {
      expect(result).toStrictEqual({ search: 'foo' });
    });
  });
});
