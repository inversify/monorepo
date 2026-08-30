import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';
import {
  type OpenApi3Dot2ParameterObject,
  type OpenApi3Dot2ReferenceObject,
} from '@inversifyjs/open-api-types/v3Dot2';
import { InversifyValidationErrorKind } from '@inversifyjs/validation-common';

import { InversifyOpenApiValidationError } from '../../../models/InversifyOpenApiValidationError.js';
import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import {
  type ResolvedParameterObject,
  resolveParameterObject,
} from './resolveParameterObject.js';

describe(resolveParameterObject, () => {
  let indexFixture: number;
  let methodFixture: string;
  let pathFixture: string;

  beforeAll(() => {
    indexFixture = 0;
    methodFixture = 'get';
    pathFixture = '/users';
  });

  describe('having a parameter object with no $ref', () => {
    let openApiResolverMock: OpenApiResolver;
    let parameterFixture: OpenApi3Dot2ParameterObject;

    beforeAll(() => {
      openApiResolverMock = {
        resolveJsonSchema: vitest.fn(),
        resolveOpenApiReference: vitest.fn(),
      };
      parameterFixture = {
        in: 'query',
        name: 'page',
        schema: { type: 'integer' },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveParameterObject(
          openApiResolverMock,
          parameterFixture,
          methodFixture,
          pathFixture,
          indexFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not call openApiResolver.resolveOpenApiReference()', () => {
        expect(
          openApiResolverMock.resolveOpenApiReference,
        ).not.toHaveBeenCalled();
      });

      it('should return the parameter object', () => {
        const expected: ResolvedParameterObject = {
          parameter: parameterFixture,
          pointerPrefix: undefined,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a $ref that fails to resolve', () => {
    let openApiResolverMock: OpenApiResolver;
    let reasonFixture: string;
    let referenceFixture: OpenApi3Dot2ReferenceObject;

    beforeAll(() => {
      reasonFixture =
        'Failed to resolve JSON Pointer: /components/parameters/Missing';
      referenceFixture = {
        $ref: '#/components/parameters/Missing',
      };
      openApiResolverMock = {
        resolveJsonSchema: vitest.fn(),
        resolveOpenApiReference: vitest.fn(),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(openApiResolverMock.resolveOpenApiReference)
          .mockReturnValueOnce({
            isRight: false,
            value: {
              reason: reasonFixture,
              resolutionContextStack: [],
            },
          });

        try {
          resolveParameterObject(
            openApiResolverMock,
            referenceFixture,
            methodFixture,
            pathFixture,
            indexFixture,
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
          openApiResolverMock.resolveOpenApiReference,
        ).toHaveBeenCalledExactlyOnceWith(referenceFixture);
      });

      it('should throw an InversifyOpenApiValidationError', () => {
        const expectedErrorProperties: Partial<InversifyOpenApiValidationError> =
          {
            kind: InversifyValidationErrorKind.validationFailed,
            message: `Could not resolve $ref pointer ${referenceFixture.$ref} for parameter at path: ${pathFixture} and method: ${methodFixture} and index: ${String(indexFixture)}: ${reasonFixture}`,
          };

        expect(result).toBeInstanceOf(InversifyOpenApiValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having a $ref that resolves to a valid parameter object', () => {
    let openApiResolverMock: OpenApiResolver;
    let referenceFixture: OpenApi3Dot2ReferenceObject & JsonValue;
    let resolvedParameterFixture: OpenApi3Dot2ParameterObject;

    beforeAll(() => {
      referenceFixture = {
        $ref: '#/components/parameters/PageParam',
      };
      resolvedParameterFixture = {
        in: 'query',
        name: 'page',
        schema: { type: 'integer' },
      };
      openApiResolverMock = {
        resolveJsonSchema: vitest.fn(),
        resolveOpenApiReference: vitest.fn(),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(openApiResolverMock.resolveOpenApiReference)
          .mockReturnValueOnce({
            isRight: true,
            value: {
              chain: [
                {
                  $ref: referenceFixture.$ref,
                  canonicalId: `urn:inversifyjs:openapi-v3dot2-spec#/components/parameters/PageParam`,
                  value: referenceFixture,
                },
              ],
              value: resolvedParameterFixture as unknown as JsonValue,
            },
          });

        result = resolveParameterObject(
          openApiResolverMock,
          referenceFixture,
          methodFixture,
          pathFixture,
          indexFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call openApiResolver.resolveOpenApiReference()', () => {
        expect(
          openApiResolverMock.resolveOpenApiReference,
        ).toHaveBeenCalledExactlyOnceWith(referenceFixture);
      });

      it('should return the resolved parameter object', () => {
        const expected: ResolvedParameterObject = {
          parameter: resolvedParameterFixture,
          pointerPrefix: 'components/parameters/PageParam',
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having a $ref that resolves to a schema object', () => {
    let openApiResolverMock: OpenApiResolver;
    let referenceFixture: OpenApi3Dot2ReferenceObject;

    beforeAll(() => {
      referenceFixture = {
        $ref: '#/components/schemas/User',
      };
      openApiResolverMock = {
        resolveJsonSchema: vitest.fn(),
        resolveOpenApiReference: vitest.fn(),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(openApiResolverMock.resolveOpenApiReference)
          .mockReturnValueOnce({
            isRight: true,
            value: {
              chain: [],
              value: {
                type: 'object',
              },
            },
          });

        try {
          resolveParameterObject(
            openApiResolverMock,
            referenceFixture,
            methodFixture,
            pathFixture,
            indexFixture,
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
            message: `Resolved $ref pointer ${referenceFixture.$ref} is not a valid parameter object at path: ${pathFixture} and method: ${methodFixture} and index: ${String(indexFixture)}`,
          };

        expect(result).toBeInstanceOf(InversifyOpenApiValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having a $ref that resolves to an array', () => {
    let openApiResolverMock: OpenApiResolver;
    let referenceFixture: OpenApi3Dot2ReferenceObject;

    beforeAll(() => {
      referenceFixture = {
        $ref: '#/components/parameters/PageParam',
      };
      openApiResolverMock = {
        resolveJsonSchema: vitest.fn(),
        resolveOpenApiReference: vitest.fn(),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(openApiResolverMock.resolveOpenApiReference)
          .mockReturnValueOnce({
            isRight: true,
            value: {
              chain: [],
              value: [],
            },
          });

        try {
          resolveParameterObject(
            openApiResolverMock,
            referenceFixture,
            methodFixture,
            pathFixture,
            indexFixture,
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
            message: `Resolved $ref pointer ${referenceFixture.$ref} is not a valid parameter object at path: ${pathFixture} and method: ${methodFixture} and index: ${String(indexFixture)}`,
          };

        expect(result).toBeInstanceOf(InversifyOpenApiValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having a $ref that resolves to null', () => {
    let openApiResolverMock: OpenApiResolver;
    let referenceFixture: OpenApi3Dot2ReferenceObject;

    beforeAll(() => {
      referenceFixture = {
        $ref: '#/components/parameters/PageParam',
      };
      openApiResolverMock = {
        resolveJsonSchema: vitest.fn(),
        resolveOpenApiReference: vitest.fn(),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(openApiResolverMock.resolveOpenApiReference)
          .mockReturnValueOnce({
            isRight: true,
            value: {
              chain: [],
              value: null,
            },
          });

        try {
          resolveParameterObject(
            openApiResolverMock,
            referenceFixture,
            methodFixture,
            pathFixture,
            indexFixture,
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
            message: `Resolved $ref pointer ${referenceFixture.$ref} is not a valid parameter object at path: ${pathFixture} and method: ${methodFixture} and index: ${String(indexFixture)}`,
          };

        expect(result).toBeInstanceOf(InversifyOpenApiValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });
});
