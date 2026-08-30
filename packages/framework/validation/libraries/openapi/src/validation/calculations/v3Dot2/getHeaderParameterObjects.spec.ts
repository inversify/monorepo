import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/json-schema-pointer'));
vitest.mock(import('./getOperationObject.js'));
vitest.mock(import('./getPathItemObject.js'));

import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import { type JsonValue } from '@inversifyjs/json-schema-types';
import {
  type OpenApi3Dot2Object,
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2ParameterObject,
  type OpenApi3Dot2PathItemObject,
  type OpenApi3Dot2ReferenceObject,
} from '@inversifyjs/open-api-types/v3Dot2';
import { InversifyValidationErrorKind } from '@inversifyjs/validation-common';

import { InversifyOpenApiValidationError } from '../../../models/InversifyOpenApiValidationError.js';
import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import {
  getHeaderParameterObjects,
  type HeaderParameterEntry,
} from './getHeaderParameterObjects.js';
import { getOperationObject } from './getOperationObject.js';
import { getPathItemObject } from './getPathItemObject.js';

describe(getHeaderParameterObjects, () => {
  let openApiObjectFixture: OpenApi3Dot2Object;
  let pathFixture: string;
  let methodFixture: string;

  beforeAll(() => {
    openApiObjectFixture = Symbol() as unknown as OpenApi3Dot2Object;
    pathFixture = '/users';
    methodFixture = 'get';

    vitest
      .mocked(escapeJsonPointerFragments)
      .mockImplementation((...fragments: string[]) => fragments.join('/'));
  });

  afterAll(() => {
    vitest.clearAllMocks();
  });

  describe('when called, and operation has header parameters only', () => {
    let openApiResolverFixture: OpenApiResolver;
    let result: Map<string, HeaderParameterEntry>;

    beforeAll(() => {
      const parameterFixture: OpenApi3Dot2ParameterObject = {
        in: 'header',
        name: 'X-Request-ID',
        required: true,
        schema: { type: 'string' },
      };

      const operationFixture: OpenApi3Dot2OperationObject = {
        parameters: [parameterFixture],
        responses: {},
      };

      const pathItemFixture: OpenApi3Dot2PathItemObject = {
        get: operationFixture,
      };

      openApiResolverFixture = {
        resolveJsonSchema: vitest.fn(),
        resolveOpenApiReference: vitest.fn(),
      };

      vitest.mocked(getPathItemObject).mockReturnValueOnce(pathItemFixture);
      vitest.mocked(getOperationObject).mockReturnValueOnce(operationFixture);

      result = getHeaderParameterObjects(
        openApiObjectFixture,
        openApiResolverFixture,
        methodFixture,
        pathFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should not call openApiResolver.resolveOpenApiReference()', () => {
      expect(
        openApiResolverFixture.resolveOpenApiReference,
      ).not.toHaveBeenCalled();
    });

    it('should return a map with the header parameter', () => {
      expect(result.size).toBe(1);
      expect(result.has('x-request-id')).toBe(true);
    });

    it('should return entry with correct pointer prefix', () => {
      const entry: HeaderParameterEntry = result.get(
        'x-request-id',
      ) as HeaderParameterEntry;

      expect(entry.pointerPrefix).toBe(
        `paths/${pathFixture}/${methodFixture}/parameters/0`,
      );
    });
  });

  describe('when called, and path item has header parameters only', () => {
    let openApiResolverFixture: OpenApiResolver;
    let result: Map<string, HeaderParameterEntry>;

    beforeAll(() => {
      const parameterFixture: OpenApi3Dot2ParameterObject = {
        in: 'header',
        name: 'X-Tenant-ID',
        required: true,
        schema: { type: 'string' },
      };

      const operationFixture: OpenApi3Dot2OperationObject = {
        responses: {},
      };

      const pathItemFixture: OpenApi3Dot2PathItemObject = {
        get: operationFixture,
        parameters: [parameterFixture],
      };

      openApiResolverFixture = {
        resolveJsonSchema: vitest.fn(),
        resolveOpenApiReference: vitest.fn(),
      };

      vitest.mocked(getPathItemObject).mockReturnValueOnce(pathItemFixture);
      vitest.mocked(getOperationObject).mockReturnValueOnce(operationFixture);

      result = getHeaderParameterObjects(
        openApiObjectFixture,
        openApiResolverFixture,
        methodFixture,
        pathFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return a map with the header parameter', () => {
      expect(result.size).toBe(1);
      expect(result.has('x-tenant-id')).toBe(true);
    });

    it('should return entry with path-item pointer prefix', () => {
      const entry: HeaderParameterEntry = result.get(
        'x-tenant-id',
      ) as HeaderParameterEntry;

      expect(entry.pointerPrefix).toBe(`paths/${pathFixture}/parameters/0`);
    });
  });

  describe('when called, and operation overrides path-item parameter', () => {
    let openApiResolverFixture: OpenApiResolver;
    let result: Map<string, HeaderParameterEntry>;

    beforeAll(() => {
      const pathItemParamFixture: OpenApi3Dot2ParameterObject = {
        in: 'header',
        name: 'X-Version',
        schema: { type: 'string' },
      };

      const operationParamFixture: OpenApi3Dot2ParameterObject = {
        in: 'header',
        name: 'X-Version',
        schema: { enum: ['v1', 'v2'], type: 'string' },
      };

      const operationFixture: OpenApi3Dot2OperationObject = {
        parameters: [operationParamFixture],
        responses: {},
      };

      const pathItemFixture: OpenApi3Dot2PathItemObject = {
        get: operationFixture,
        parameters: [pathItemParamFixture],
      };

      openApiResolverFixture = {
        resolveJsonSchema: vitest.fn(),
        resolveOpenApiReference: vitest.fn(),
      };

      vitest.mocked(getPathItemObject).mockReturnValueOnce(pathItemFixture);
      vitest.mocked(getOperationObject).mockReturnValueOnce(operationFixture);

      result = getHeaderParameterObjects(
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
      const entry: HeaderParameterEntry = result.get(
        'x-version',
      ) as HeaderParameterEntry;

      expect(entry.parameter.schema).toStrictEqual({
        enum: ['v1', 'v2'],
        type: 'string',
      });
    });
  });

  describe('when called, and parameter is a $ref reference', () => {
    let openApiResolverFixture: OpenApiResolver;
    let refFixture: OpenApi3Dot2ReferenceObject;
    let result: Map<string, HeaderParameterEntry>;

    beforeAll(() => {
      refFixture = {
        $ref: '#/components/parameters/ApiKeyHeader',
      };

      const resolvedParamFixture: OpenApi3Dot2ParameterObject = {
        in: 'header',
        name: 'X-Api-Key',
        required: true,
        schema: { type: 'string' },
      };

      const operationFixture: OpenApi3Dot2OperationObject = {
        parameters: [refFixture],
        responses: {},
      };

      const pathItemFixture: OpenApi3Dot2PathItemObject = {
        get: operationFixture,
      };

      openApiResolverFixture = {
        resolveJsonSchema: vitest.fn(),
        resolveOpenApiReference: vitest.fn().mockReturnValueOnce({
          isRight: true,
          value: {
            chain: [
              {
                $ref: refFixture.$ref,
                canonicalId:
                  'urn:inversifyjs:openapi-v3dot2-spec#/components/parameters/ApiKeyHeader',
                value: refFixture as unknown as JsonValue,
              },
            ],
            value: resolvedParamFixture as unknown as JsonValue,
          },
        }),
      };

      vitest.mocked(getPathItemObject).mockReturnValueOnce(pathItemFixture);
      vitest.mocked(getOperationObject).mockReturnValueOnce(operationFixture);

      result = getHeaderParameterObjects(
        openApiObjectFixture,
        openApiResolverFixture,
        methodFixture,
        pathFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call openApiResolver.resolveOpenApiReference()', () => {
      expect(
        openApiResolverFixture.resolveOpenApiReference,
      ).toHaveBeenCalledExactlyOnceWith(refFixture);
    });

    it('should resolve the $ref and return the header parameter', () => {
      expect(result.size).toBe(1);
      expect(result.has('x-api-key')).toBe(true);
    });

    it('should return entry with component pointer prefix', () => {
      const entry: HeaderParameterEntry = result.get(
        'x-api-key',
      ) as HeaderParameterEntry;

      expect(entry.pointerPrefix).toBe('components/parameters/ApiKeyHeader');
    });
  });

  describe('when called, and path item parameter is a $ref reference', () => {
    let openApiResolverFixture: OpenApiResolver;
    let refFixture: OpenApi3Dot2ReferenceObject;
    let result: Map<string, HeaderParameterEntry>;

    beforeAll(() => {
      refFixture = {
        $ref: '#/components/parameters/ApiKeyHeader',
      };

      const resolvedParamFixture: OpenApi3Dot2ParameterObject = {
        in: 'header',
        name: 'X-Api-Key',
        required: true,
        schema: { type: 'string' },
      };

      const operationFixture: OpenApi3Dot2OperationObject = {
        responses: {},
      };

      const pathItemFixture: OpenApi3Dot2PathItemObject = {
        get: operationFixture,
        parameters: [refFixture],
      };

      openApiResolverFixture = {
        resolveJsonSchema: vitest.fn(),
        resolveOpenApiReference: vitest.fn().mockReturnValueOnce({
          isRight: true,
          value: {
            chain: [
              {
                $ref: refFixture.$ref,
                canonicalId:
                  'urn:inversifyjs:openapi-v3dot2-spec#/components/parameters/ApiKeyHeader',
                value: refFixture as unknown as JsonValue,
              },
            ],
            value: resolvedParamFixture as unknown as JsonValue,
          },
        }),
      };

      vitest.mocked(getPathItemObject).mockReturnValueOnce(pathItemFixture);
      vitest.mocked(getOperationObject).mockReturnValueOnce(operationFixture);

      result = getHeaderParameterObjects(
        openApiObjectFixture,
        openApiResolverFixture,
        methodFixture,
        pathFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call openApiResolver.resolveOpenApiReference()', () => {
      expect(
        openApiResolverFixture.resolveOpenApiReference,
      ).toHaveBeenCalledExactlyOnceWith(refFixture);
    });

    it('should resolve the $ref and return the header parameter', () => {
      expect(result.size).toBe(1);
      expect(result.has('x-api-key')).toBe(true);
    });

    it('should return entry with component pointer prefix', () => {
      const entry: HeaderParameterEntry = result.get(
        'x-api-key',
      ) as HeaderParameterEntry;

      expect(entry.pointerPrefix).toBe('components/parameters/ApiKeyHeader');
    });
  });

  describe('when called, and path item $ref fails to resolve', () => {
    let openApiResolverFixture: OpenApiResolver;
    let reasonFixture: string;
    let refFixture: OpenApi3Dot2ReferenceObject;
    let result: unknown;

    beforeAll(() => {
      reasonFixture =
        'Failed to resolve JSON Pointer: /components/parameters/MissingHeader';
      refFixture = {
        $ref: '#/components/parameters/MissingHeader',
      };

      const operationFixture: OpenApi3Dot2OperationObject = {
        responses: {},
      };

      const pathItemFixture: OpenApi3Dot2PathItemObject = {
        get: operationFixture,
        parameters: [refFixture],
      };

      openApiResolverFixture = {
        resolveJsonSchema: vitest.fn(),
        resolveOpenApiReference: vitest.fn().mockReturnValueOnce({
          isRight: false,
          value: {
            reason: reasonFixture,
            resolutionContextStack: [],
          },
        }),
      };

      vitest.mocked(getPathItemObject).mockReturnValueOnce(pathItemFixture);
      vitest.mocked(getOperationObject).mockReturnValueOnce(operationFixture);

      try {
        getHeaderParameterObjects(
          openApiObjectFixture,
          openApiResolverFixture,
          methodFixture,
          pathFixture,
        );
      } catch (error: unknown) {
        result = error;
      }
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call openApiResolver.resolveOpenApiReference()', () => {
      expect(
        openApiResolverFixture.resolveOpenApiReference,
      ).toHaveBeenCalledExactlyOnceWith(refFixture);
    });

    it('should throw an InversifyOpenApiValidationError', () => {
      const expectedErrorProperties: Partial<InversifyOpenApiValidationError> =
        {
          kind: InversifyValidationErrorKind.validationFailed,
          message: `Could not resolve $ref pointer ${refFixture.$ref} for parameter at path: ${pathFixture} and method: ${methodFixture} and index: 0: ${reasonFixture}`,
        };

      expect(result).toBeInstanceOf(InversifyOpenApiValidationError);
      expect(result).toMatchObject(expectedErrorProperties);
    });
  });

  describe('when called, and operation $ref fails to resolve', () => {
    let openApiResolverFixture: OpenApiResolver;
    let reasonFixture: string;
    let refFixture: OpenApi3Dot2ReferenceObject;
    let result: unknown;

    beforeAll(() => {
      reasonFixture =
        'Failed to resolve JSON Pointer: /components/parameters/MissingHeader';
      refFixture = {
        $ref: '#/components/parameters/MissingHeader',
      };

      const operationFixture: OpenApi3Dot2OperationObject = {
        parameters: [refFixture],
        responses: {},
      };

      const pathItemFixture: OpenApi3Dot2PathItemObject = {
        get: operationFixture,
      };

      openApiResolverFixture = {
        resolveJsonSchema: vitest.fn(),
        resolveOpenApiReference: vitest.fn().mockReturnValueOnce({
          isRight: false,
          value: {
            reason: reasonFixture,
            resolutionContextStack: [],
          },
        }),
      };

      vitest.mocked(getPathItemObject).mockReturnValueOnce(pathItemFixture);
      vitest.mocked(getOperationObject).mockReturnValueOnce(operationFixture);

      try {
        getHeaderParameterObjects(
          openApiObjectFixture,
          openApiResolverFixture,
          methodFixture,
          pathFixture,
        );
      } catch (error: unknown) {
        result = error;
      }
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call openApiResolver.resolveOpenApiReference()', () => {
      expect(
        openApiResolverFixture.resolveOpenApiReference,
      ).toHaveBeenCalledExactlyOnceWith(refFixture);
    });

    it('should throw an InversifyOpenApiValidationError', () => {
      const expectedErrorProperties: Partial<InversifyOpenApiValidationError> =
        {
          kind: InversifyValidationErrorKind.validationFailed,
          message: `Could not resolve $ref pointer ${refFixture.$ref} for parameter at path: ${pathFixture} and method: ${methodFixture} and index: 0: ${reasonFixture}`,
        };

      expect(result).toBeInstanceOf(InversifyOpenApiValidationError);
      expect(result).toMatchObject(expectedErrorProperties);
    });
  });

  describe('when called, and $ref resolves to a non-object', () => {
    let openApiResolverFixture: OpenApiResolver;
    let refFixture: OpenApi3Dot2ReferenceObject;
    let result: unknown;

    beforeAll(() => {
      refFixture = {
        $ref: '#/components/parameters/ApiKeyHeader',
      };

      const operationFixture: OpenApi3Dot2OperationObject = {
        parameters: [refFixture],
        responses: {},
      };

      const pathItemFixture: OpenApi3Dot2PathItemObject = {
        get: operationFixture,
      };

      openApiResolverFixture = {
        resolveJsonSchema: vitest.fn(),
        resolveOpenApiReference: vitest.fn().mockReturnValueOnce({
          isRight: true,
          value: {
            chain: [],
            value: null,
          },
        }),
      };

      vitest.mocked(getPathItemObject).mockReturnValueOnce(pathItemFixture);
      vitest.mocked(getOperationObject).mockReturnValueOnce(operationFixture);

      try {
        getHeaderParameterObjects(
          openApiObjectFixture,
          openApiResolverFixture,
          methodFixture,
          pathFixture,
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
          kind: InversifyValidationErrorKind.validationFailed,
          message: `Resolved $ref pointer ${refFixture.$ref} is not a valid parameter object at path: ${pathFixture} and method: ${methodFixture} and index: 0`,
        };

      expect(result).toBeInstanceOf(InversifyOpenApiValidationError);
      expect(result).toMatchObject(expectedErrorProperties);
    });
  });

  describe('when called, and no parameters exist', () => {
    let openApiResolverFixture: OpenApiResolver;
    let result: Map<string, HeaderParameterEntry>;

    beforeAll(() => {
      const operationFixture: OpenApi3Dot2OperationObject = {
        responses: {},
      };

      const pathItemFixture: OpenApi3Dot2PathItemObject = {
        get: operationFixture,
      };

      openApiResolverFixture = {
        resolveJsonSchema: vitest.fn(),
        resolveOpenApiReference: vitest.fn(),
      };

      vitest.mocked(getPathItemObject).mockReturnValueOnce(pathItemFixture);
      vitest.mocked(getOperationObject).mockReturnValueOnce(operationFixture);

      result = getHeaderParameterObjects(
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
});
