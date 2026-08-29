import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';
import {
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2ReferenceObject,
  type OpenApi3Dot2RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot2';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { InversifyOpenApiValidationError } from '../../../models/InversifyOpenApiValidationError.js';
import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import {
  getRequestBodyObject,
  type ResolvedRequestBodyObject,
} from './getRequestBodyObject.js';

describe(getRequestBodyObject, () => {
  let openApiResolverMock: OpenApiResolver;
  let methodFixture: string;
  let routeFixture: string;

  beforeAll(() => {
    openApiResolverMock = {
      resolveJsonSchema: vitest.fn(),
      resolveOpenApiReference: vitest.fn(),
    };
    methodFixture = 'post';
    routeFixture = '/users';
  });

  describe('having an operationObject with no requestBody', () => {
    let operationObjectFixture: OpenApi3Dot2OperationObject;

    beforeAll(() => {
      operationObjectFixture = {
        responses: {},
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          getRequestBodyObject(
            openApiResolverMock,
            operationObjectFixture,
            methodFixture,
            routeFixture,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an InversifyValidationError', () => {
        const expectedErrorProperties: Partial<InversifyValidationError> = {
          kind: InversifyValidationErrorKind.validationFailed,
          message: `No requestBody found for ${methodFixture.toUpperCase()} ${routeFixture}`,
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having an operationObject with requestBody with no $ref', () => {
    let operationObjectFixture: OpenApi3Dot2OperationObject;
    let requestBodyObjectFixture: OpenApi3Dot2RequestBodyObject;

    beforeAll(() => {
      requestBodyObjectFixture = {
        content: {
          'application/json': {},
        },
      };
      operationObjectFixture = {
        requestBody: requestBodyObjectFixture,
        responses: {},
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getRequestBodyObject(
          openApiResolverMock,
          operationObjectFixture,
          methodFixture,
          routeFixture,
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

      it('should return expected result', () => {
        const expected: ResolvedRequestBodyObject = {
          pointerPrefix: undefined,
          requestBody: requestBodyObjectFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having an operationObject with requestBody with $ref that fails to resolve', () => {
    let operationObjectFixture: OpenApi3Dot2OperationObject;
    let reasonFixture: string;
    let requestBodyReferenceFixture: OpenApi3Dot2ReferenceObject;

    beforeAll(() => {
      reasonFixture =
        'Failed to resolve JSON Pointer: /components/requestBodies/UserBody';
      requestBodyReferenceFixture = {
        $ref: '#/components/requestBodies/UserBody',
      };
      operationObjectFixture = {
        requestBody: requestBodyReferenceFixture,
        responses: {},
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
          getRequestBodyObject(
            openApiResolverMock,
            operationObjectFixture,
            methodFixture,
            routeFixture,
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
        ).toHaveBeenCalledExactlyOnceWith(requestBodyReferenceFixture);
      });

      it('should throw an InversifyOpenApiValidationError', () => {
        const expectedErrorProperties: Partial<InversifyOpenApiValidationError> =
          {
            kind: InversifyValidationErrorKind.validationFailed,
            message: `Could not resolve $ref pointer ${requestBodyReferenceFixture.$ref} for ${methodFixture.toUpperCase()} ${routeFixture}: ${reasonFixture}`,
          };

        expect(result).toBeInstanceOf(InversifyOpenApiValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having an operationObject with requestBody with $ref resolving to null', () => {
    let operationObjectFixture: OpenApi3Dot2OperationObject;
    let requestBodyReferenceFixture: OpenApi3Dot2ReferenceObject;

    beforeAll(() => {
      requestBodyReferenceFixture = {
        $ref: '#/components/requestBodies/UserBody',
      };
      operationObjectFixture = {
        requestBody: requestBodyReferenceFixture,
        responses: {},
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
          getRequestBodyObject(
            openApiResolverMock,
            operationObjectFixture,
            methodFixture,
            routeFixture,
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
        ).toHaveBeenCalledExactlyOnceWith(requestBodyReferenceFixture);
      });

      it('should throw an InversifyOpenApiValidationError', () => {
        const expectedErrorProperties: Partial<InversifyOpenApiValidationError> =
          {
            kind: InversifyValidationErrorKind.validationFailed,
            message: `Resolved $ref pointer ${requestBodyReferenceFixture.$ref} is not a valid request body object for ${methodFixture.toUpperCase()} ${routeFixture}`,
          };

        expect(result).toBeInstanceOf(InversifyOpenApiValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having an operationObject with requestBody with $ref resolving to an array', () => {
    let operationObjectFixture: OpenApi3Dot2OperationObject;
    let requestBodyReferenceFixture: OpenApi3Dot2ReferenceObject;

    beforeAll(() => {
      requestBodyReferenceFixture = {
        $ref: '#/components/requestBodies/UserBody',
      };
      operationObjectFixture = {
        requestBody: requestBodyReferenceFixture,
        responses: {},
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
          getRequestBodyObject(
            openApiResolverMock,
            operationObjectFixture,
            methodFixture,
            routeFixture,
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
        ).toHaveBeenCalledExactlyOnceWith(requestBodyReferenceFixture);
      });

      it('should throw an InversifyOpenApiValidationError', () => {
        const expectedErrorProperties: Partial<InversifyOpenApiValidationError> =
          {
            kind: InversifyValidationErrorKind.validationFailed,
            message: `Resolved $ref pointer ${requestBodyReferenceFixture.$ref} is not a valid request body object for ${methodFixture.toUpperCase()} ${routeFixture}`,
          };

        expect(result).toBeInstanceOf(InversifyOpenApiValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having an operationObject with requestBody with $ref resolving to a schema object', () => {
    let operationObjectFixture: OpenApi3Dot2OperationObject;
    let requestBodyReferenceFixture: OpenApi3Dot2ReferenceObject;

    beforeAll(() => {
      requestBodyReferenceFixture = {
        $ref: '#/components/schemas/User',
      };
      operationObjectFixture = {
        requestBody: requestBodyReferenceFixture,
        responses: {},
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
          getRequestBodyObject(
            openApiResolverMock,
            operationObjectFixture,
            methodFixture,
            routeFixture,
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
            message: `Resolved $ref pointer ${requestBodyReferenceFixture.$ref} is not a valid request body object for ${methodFixture.toUpperCase()} ${routeFixture}`,
          };

        expect(result).toBeInstanceOf(InversifyOpenApiValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having an operationObject with requestBody with $ref resolving to a valid object', () => {
    let operationObjectFixture: OpenApi3Dot2OperationObject;
    let requestBodyReferenceFixture: OpenApi3Dot2ReferenceObject;
    let resolvedObjectFixture: OpenApi3Dot2RequestBodyObject;

    beforeAll(() => {
      requestBodyReferenceFixture = {
        $ref: '#/components/requestBodies/UserBody',
      };
      resolvedObjectFixture = {
        content: {
          'application/json': {},
        },
      };
      operationObjectFixture = {
        requestBody: requestBodyReferenceFixture,
        responses: {},
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
                  $ref: requestBodyReferenceFixture.$ref,
                  canonicalId:
                    'urn:inversifyjs:openapi-v3dot2-spec#/components/requestBodies/UserBody',
                  value: requestBodyReferenceFixture as unknown as JsonValue,
                },
              ],
              value: resolvedObjectFixture as unknown as JsonValue,
            },
          });

        result = getRequestBodyObject(
          openApiResolverMock,
          operationObjectFixture,
          methodFixture,
          routeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call openApiResolver.resolveOpenApiReference()', () => {
        expect(
          openApiResolverMock.resolveOpenApiReference,
        ).toHaveBeenCalledExactlyOnceWith(requestBodyReferenceFixture);
      });

      it('should return expected result', () => {
        const expected: ResolvedRequestBodyObject = {
          pointerPrefix: 'components/requestBodies/UserBody',
          requestBody: resolvedObjectFixture,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
