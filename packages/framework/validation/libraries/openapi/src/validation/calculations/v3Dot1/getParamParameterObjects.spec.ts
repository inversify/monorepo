import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/json-schema-pointer'));
vitest.mock(import('./getOperationObject.js'));
vitest.mock(import('./getPathItemObject.js'));

import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import {
  type OpenApi3Dot1Object,
  type OpenApi3Dot1OperationObject,
  type OpenApi3Dot1ParameterObject,
  type OpenApi3Dot1PathItemObject,
  type OpenApi3Dot1ReferenceObject,
} from '@inversifyjs/open-api-types/v3Dot1';

import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import { getOperationObject } from './getOperationObject.js';
import {
  getParamParameterObjects,
  type ParamParameterEntry,
} from './getParamParameterObjects.js';
import { getPathItemObject } from './getPathItemObject.js';

describe(getParamParameterObjects, () => {
  let openApiObjectFixture: OpenApi3Dot1Object;
  let pathFixture: string;
  let methodFixture: string;

  beforeAll(() => {
    openApiObjectFixture = Symbol() as unknown as OpenApi3Dot1Object;
    pathFixture = '/users/{userId}';
    methodFixture = 'get';

    vitest
      .mocked(escapeJsonPointerFragments)
      .mockImplementation((...fragments: string[]) => fragments.join('/'));
  });

  afterAll(() => {
    vitest.clearAllMocks();
  });

  describe('when called, and operation has path parameters only', () => {
    let openApiResolverFixture: OpenApiResolver;
    let result: Map<string, ParamParameterEntry>;

    beforeAll(() => {
      const parameterFixture: OpenApi3Dot1ParameterObject = {
        in: 'path',
        name: 'userId',
        required: true,
        schema: { type: 'string' },
      };

      const operationFixture: OpenApi3Dot1OperationObject = {
        parameters: [parameterFixture],
        responses: {},
      };

      const pathItemFixture: OpenApi3Dot1PathItemObject = {
        get: operationFixture,
      };

      openApiResolverFixture = {
        deepResolveReference: vitest.fn(),
        resolveReference: vitest.fn(),
      };

      vitest.mocked(getPathItemObject).mockReturnValueOnce(pathItemFixture);
      vitest.mocked(getOperationObject).mockReturnValueOnce(operationFixture);

      result = getParamParameterObjects(
        openApiObjectFixture,
        openApiResolverFixture,
        methodFixture,
        pathFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return a map with the path parameter', () => {
      expect(result.size).toBe(1);
      expect(result.has('userId')).toBe(true);
    });

    it('should return entry with correct pointer prefix', () => {
      const entry: ParamParameterEntry = result.get(
        'userId',
      ) as ParamParameterEntry;

      expect(entry.pointerPrefix).toBe(
        `paths/${pathFixture}/${methodFixture}/parameters/0`,
      );
    });
  });

  describe('when called, and path item has path parameters only', () => {
    let openApiResolverFixture: OpenApiResolver;
    let result: Map<string, ParamParameterEntry>;

    beforeAll(() => {
      const parameterFixture: OpenApi3Dot1ParameterObject = {
        in: 'path',
        name: 'userId',
        required: true,
        schema: { type: 'string' },
      };

      const operationFixture: OpenApi3Dot1OperationObject = {
        responses: {},
      };

      const pathItemFixture: OpenApi3Dot1PathItemObject = {
        get: operationFixture,
        parameters: [parameterFixture],
      };

      openApiResolverFixture = {
        deepResolveReference: vitest.fn(),
        resolveReference: vitest.fn(),
      };

      vitest.mocked(getPathItemObject).mockReturnValueOnce(pathItemFixture);
      vitest.mocked(getOperationObject).mockReturnValueOnce(operationFixture);

      result = getParamParameterObjects(
        openApiObjectFixture,
        openApiResolverFixture,
        methodFixture,
        pathFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return a map with the path parameter', () => {
      expect(result.size).toBe(1);
      expect(result.has('userId')).toBe(true);
    });

    it('should return entry with path-item pointer prefix', () => {
      const entry: ParamParameterEntry = result.get(
        'userId',
      ) as ParamParameterEntry;

      expect(entry.pointerPrefix).toBe(`paths/${pathFixture}/parameters/0`);
    });
  });

  describe('when called, and operation overrides path-item parameter', () => {
    let openApiResolverFixture: OpenApiResolver;
    let result: Map<string, ParamParameterEntry>;

    beforeAll(() => {
      const pathItemParamFixture: OpenApi3Dot1ParameterObject = {
        in: 'path',
        name: 'userId',
        schema: { type: 'string' },
      };

      const operationParamFixture: OpenApi3Dot1ParameterObject = {
        in: 'path',
        name: 'userId',
        schema: { format: 'uuid', type: 'string' },
      };

      const operationFixture: OpenApi3Dot1OperationObject = {
        parameters: [operationParamFixture],
        responses: {},
      };

      const pathItemFixture: OpenApi3Dot1PathItemObject = {
        get: operationFixture,
        parameters: [pathItemParamFixture],
      };

      openApiResolverFixture = {
        deepResolveReference: vitest.fn(),
        resolveReference: vitest.fn(),
      };

      vitest.mocked(getPathItemObject).mockReturnValueOnce(pathItemFixture);
      vitest.mocked(getOperationObject).mockReturnValueOnce(operationFixture);

      result = getParamParameterObjects(
        openApiObjectFixture,
        openApiResolverFixture,
        methodFixture,
        pathFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return only one entry (operation overrides)', () => {
      expect(result.size).toBe(1);
    });

    it('should use the operation-level parameter', () => {
      const entry: ParamParameterEntry = result.get(
        'userId',
      ) as ParamParameterEntry;

      expect(entry.parameter.schema).toStrictEqual({
        format: 'uuid',
        type: 'string',
      });
    });

    it('should have operation pointer prefix', () => {
      const entry: ParamParameterEntry = result.get(
        'userId',
      ) as ParamParameterEntry;

      expect(entry.pointerPrefix).toBe(
        `paths/${pathFixture}/${methodFixture}/parameters/0`,
      );
    });
  });

  describe('when called, and parameter is a $ref reference', () => {
    let openApiResolverFixture: OpenApiResolver;
    let result: Map<string, ParamParameterEntry>;

    beforeAll(() => {
      const refFixture: OpenApi3Dot1ReferenceObject = {
        $ref: '#/components/parameters/UserIdParam',
      };

      const resolvedParamFixture: OpenApi3Dot1ParameterObject = {
        in: 'path',
        name: 'userId',
        required: true,
        schema: { type: 'string' },
      };

      const operationFixture: OpenApi3Dot1OperationObject = {
        parameters: [refFixture],
        responses: {},
      };

      const pathItemFixture: OpenApi3Dot1PathItemObject = {
        get: operationFixture,
      };

      openApiResolverFixture = {
        deepResolveReference: vitest
          .fn()
          .mockReturnValueOnce(resolvedParamFixture),
        resolveReference: vitest.fn(),
      };

      vitest.mocked(getPathItemObject).mockReturnValueOnce(pathItemFixture);
      vitest.mocked(getOperationObject).mockReturnValueOnce(operationFixture);

      result = getParamParameterObjects(
        openApiObjectFixture,
        openApiResolverFixture,
        methodFixture,
        pathFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should resolve the $ref and return the path parameter', () => {
      expect(result.size).toBe(1);
      expect(result.has('userId')).toBe(true);
    });

    it('should call deepResolveReference', () => {
      expect(
        openApiResolverFixture.deepResolveReference,
      ).toHaveBeenCalledExactlyOnceWith('#/components/parameters/UserIdParam');
    });
  });

  describe('when called, and no parameters exist', () => {
    let openApiResolverFixture: OpenApiResolver;
    let result: Map<string, ParamParameterEntry>;

    beforeAll(() => {
      const operationFixture: OpenApi3Dot1OperationObject = {
        responses: {},
      };

      const pathItemFixture: OpenApi3Dot1PathItemObject = {
        get: operationFixture,
      };

      openApiResolverFixture = {
        deepResolveReference: vitest.fn(),
        resolveReference: vitest.fn(),
      };

      vitest.mocked(getPathItemObject).mockReturnValueOnce(pathItemFixture);
      vitest.mocked(getOperationObject).mockReturnValueOnce(operationFixture);

      result = getParamParameterObjects(
        openApiObjectFixture,
        openApiResolverFixture,
        methodFixture,
        pathFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return empty map', () => {
      expect(result.size).toBe(0);
    });
  });

  describe('when called, and parameters include non-path params', () => {
    let openApiResolverFixture: OpenApiResolver;
    let result: Map<string, ParamParameterEntry>;

    beforeAll(() => {
      const pathParam: OpenApi3Dot1ParameterObject = {
        in: 'path',
        name: 'userId',
        schema: { type: 'string' },
      };

      const queryParam: OpenApi3Dot1ParameterObject = {
        in: 'query',
        name: 'page',
        schema: { type: 'integer' },
      };

      const operationFixture: OpenApi3Dot1OperationObject = {
        parameters: [pathParam, queryParam],
        responses: {},
      };

      const pathItemFixture: OpenApi3Dot1PathItemObject = {
        get: operationFixture,
      };

      openApiResolverFixture = {
        deepResolveReference: vitest.fn(),
        resolveReference: vitest.fn(),
      };

      vitest.mocked(getPathItemObject).mockReturnValueOnce(pathItemFixture);
      vitest.mocked(getOperationObject).mockReturnValueOnce(operationFixture);

      result = getParamParameterObjects(
        openApiObjectFixture,
        openApiResolverFixture,
        methodFixture,
        pathFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return only path parameters', () => {
      expect(result.size).toBe(1);
      expect(result.has('userId')).toBe(true);
    });
  });
});
