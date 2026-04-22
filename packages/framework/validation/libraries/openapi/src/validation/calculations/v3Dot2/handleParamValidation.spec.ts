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

vitest.mock(import('../buildParamParse.js'));
vitest.mock(import('./getParamParameterObjects.js'));

import { type OpenApi3Dot2Object } from '@inversifyjs/open-api-types/v3Dot2';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import type Ajv from 'ajv';
import { type ValidateFunction } from 'ajv';

import { type OpenApiRouter } from '../../../router/services/OpenApiRouter.js';
import { type OpenApiValidationContext } from '../../models/OpenApiValidationContext.js';
import { type ParamValidationInputParam } from '../../models/ParamValidationInputParam.js';
import { type ValidationCacheEntry } from '../../models/v3Dot2/ValidationCacheEntry.js';
import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import { buildParamParse } from '../buildParamParse.js';
import {
  getParamParameterObjects,
  type ParamParameterEntry,
} from './getParamParameterObjects.js';
import { handleParamValidation } from './handleParamValidation.js';

describe(handleParamValidation, () => {
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

  describe('when called, and params are valid with string type', () => {
    let result: unknown;

    beforeAll(() => {
      const paramParamMap: Map<string, ParamParameterEntry> = new Map([
        [
          'userId',
          {
            parameter: {
              in: 'path',
              name: 'userId',
              required: true,
              schema: { type: 'string' },
            },
            pointerPrefix: 'paths/~1users~1{userId}/get/parameters/0',
          },
        ],
      ]);

      vitest
        .mocked(getParamParameterObjects)
        .mockReturnValueOnce(paramParamMap);

      const parseMock: Mock = vitest.fn().mockReturnValueOnce('abc-123');

      vitest.mocked(buildParamParse).mockReturnValueOnce(parseMock);

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
      };

      const getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      > = vitest.fn().mockReturnValueOnce(validationCacheEntry);

      const inputParam: ParamValidationInputParam = {
        method: 'get',
        params: { userId: 'abc-123' },
        path: '/users/{userId}',
        type: Symbol() as unknown as ParamValidationInputParam['type'],
      };

      vitest
        .mocked(openApiRouterMock.findRoute)
        .mockReturnValueOnce(inputParam.path);

      result = handleParamValidation(
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

    it('should return validated params record', () => {
      expect(result).toStrictEqual({ userId: 'abc-123' });
    });
  });

  describe('when called, and required param is missing', () => {
    let result: unknown;

    beforeAll(() => {
      const paramParamMap: Map<string, ParamParameterEntry> = new Map([
        [
          'userId',
          {
            parameter: {
              in: 'path',
              name: 'userId',
              required: true,
              schema: { type: 'string' },
            },
            pointerPrefix: 'paths/~1users~1{userId}/get/parameters/0',
          },
        ],
      ]);

      vitest
        .mocked(getParamParameterObjects)
        .mockReturnValueOnce(paramParamMap);

      const parseMock: Mock = vitest.fn();

      vitest.mocked(buildParamParse).mockReturnValueOnce(parseMock);

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
      };

      const getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      > = vitest.fn().mockReturnValueOnce(validationCacheEntry);

      const inputParam: ParamValidationInputParam = {
        method: 'get',
        params: {},
        path: '/users/{userId}',
        type: Symbol() as unknown as ParamValidationInputParam['type'],
      };

      vitest
        .mocked(openApiRouterMock.findRoute)
        .mockReturnValueOnce(inputParam.path);

      try {
        handleParamValidation(
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
        message: 'Missing required param: userId',
      };

      expect(result).toBeInstanceOf(InversifyValidationError);
      expect(result).toMatchObject(expectedErrorProperties);
    });
  });

  describe('when called, and validation fails', () => {
    let result: unknown;

    beforeAll(() => {
      const paramParamMap: Map<string, ParamParameterEntry> = new Map([
        [
          'userId',
          {
            parameter: {
              in: 'path',
              name: 'userId',
              required: true,
              schema: { minimum: 1, type: 'integer' },
            },
            pointerPrefix: 'paths/~1users~1{userId}/get/parameters/0',
          },
        ],
      ]);

      vitest
        .mocked(getParamParameterObjects)
        .mockReturnValueOnce(paramParamMap);

      const parseMock: Mock = vitest.fn().mockReturnValueOnce('not-valid');

      vitest.mocked(buildParamParse).mockReturnValueOnce(parseMock);

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
      };

      const getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      > = vitest.fn().mockReturnValueOnce(validationCacheEntry);

      const inputParam: ParamValidationInputParam = {
        method: 'get',
        params: { userId: 'not-valid' },
        path: '/users/{userId}',
        type: Symbol() as unknown as ParamValidationInputParam['type'],
      };

      vitest
        .mocked(openApiRouterMock.findRoute)
        .mockReturnValueOnce(inputParam.path);

      try {
        handleParamValidation(
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
        message: expect.stringContaining('userId'),
      };

      expect(result).toBeInstanceOf(InversifyValidationError);
      expect(result).toMatchObject(expectedErrorProperties);
    });
  });

  describe('when called, and cached params are reused', () => {
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
        body: undefined,
        headers: undefined,
        params: new Map([
          [
            'userId',
            {
              parse: parseMock,
              validate: validateMock,
            },
          ],
        ]),
      };

      const getEntryMock: Mock<
        (path: string, method: string) => ValidationCacheEntry
      > = vitest.fn().mockReturnValueOnce(validationCacheEntry);

      const inputParam: ParamValidationInputParam = {
        method: 'get',
        params: { userId: 'test' },
        path: '/users/{userId}',
        type: Symbol() as unknown as ParamValidationInputParam['type'],
      };

      vitest
        .mocked(openApiRouterMock.findRoute)
        .mockReturnValueOnce(inputParam.path);

      result = handleParamValidation(
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

    it('should not call getParamParameterObjects()', () => {
      expect(getParamParameterObjects).not.toHaveBeenCalled();
    });

    it('should return validated params', () => {
      expect(result).toStrictEqual({ userId: 'test' });
    });
  });
});
