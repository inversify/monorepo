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
import { getPathItemObject } from './getPathItemObject.js';
import {
  getQueryParameterObjects,
  type QueryParameterEntry,
} from './getQueryParameterObjects.js';

describe(getQueryParameterObjects, () => {
  let openApiObjectFixture: OpenApi3Dot1Object;
  let pathFixture: string;
  let methodFixture: string;

  beforeAll(() => {
    openApiObjectFixture = Symbol() as unknown as OpenApi3Dot1Object;
    pathFixture = '/users';
    methodFixture = 'get';

    vitest
      .mocked(escapeJsonPointerFragments)
      .mockImplementation((...fragments: string[]) => fragments.join('/'));
  });

  afterAll(() => {
    vitest.clearAllMocks();
  });

  describe('when called, and operation has query parameters only', () => {
    let openApiResolverFixture: OpenApiResolver;
    let result: Map<string, QueryParameterEntry>;

    beforeAll(() => {
      const parameterFixture: OpenApi3Dot1ParameterObject = {
        in: 'query',
        name: 'page',
        required: true,
        schema: { type: 'integer' },
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

      result = getQueryParameterObjects(
        openApiObjectFixture,
        openApiResolverFixture,
        methodFixture,
        pathFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return a map with the query parameter', () => {
      expect(result.size).toBe(1);
      expect(result.has('page')).toBe(true);
    });

    it('should return entry with correct pointer prefix', () => {
      const entry: QueryParameterEntry = result.get(
        'page',
      ) as QueryParameterEntry;

      expect(entry.pointerPrefix).toBe(
        `paths/${pathFixture}/${methodFixture}/parameters/0`,
      );
    });
  });

  describe('when called, and path item has query parameters only', () => {
    let openApiResolverFixture: OpenApiResolver;
    let result: Map<string, QueryParameterEntry>;

    beforeAll(() => {
      const parameterFixture: OpenApi3Dot1ParameterObject = {
        in: 'query',
        name: 'page',
        schema: { type: 'integer' },
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

      result = getQueryParameterObjects(
        openApiObjectFixture,
        openApiResolverFixture,
        methodFixture,
        pathFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return entry with path-item pointer prefix', () => {
      const entry: QueryParameterEntry = result.get(
        'page',
      ) as QueryParameterEntry;

      expect(entry.pointerPrefix).toBe(`paths/${pathFixture}/parameters/0`);
    });
  });

  describe('when called, and parameter is a $ref reference', () => {
    let openApiResolverFixture: OpenApiResolver;
    let result: Map<string, QueryParameterEntry>;

    beforeAll(() => {
      const refFixture: OpenApi3Dot1ReferenceObject = {
        $ref: '#/components/parameters/PageParam',
      };

      const resolvedParamFixture: OpenApi3Dot1ParameterObject = {
        in: 'query',
        name: 'page',
        schema: { type: 'integer' },
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

      result = getQueryParameterObjects(
        openApiObjectFixture,
        openApiResolverFixture,
        methodFixture,
        pathFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should resolve the $ref and return the query parameter', () => {
      expect(result.size).toBe(1);
      expect(result.has('page')).toBe(true);
    });

    it('should call deepResolveReference', () => {
      expect(
        openApiResolverFixture.deepResolveReference,
      ).toHaveBeenCalledExactlyOnceWith('#/components/parameters/PageParam');
    });
  });

  describe('when called, and parameters include non-query params', () => {
    let openApiResolverFixture: OpenApiResolver;
    let result: Map<string, QueryParameterEntry>;

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

      result = getQueryParameterObjects(
        openApiObjectFixture,
        openApiResolverFixture,
        methodFixture,
        pathFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return only query parameters', () => {
      expect(result.size).toBe(1);
      expect(result.has('page')).toBe(true);
    });
  });
});
