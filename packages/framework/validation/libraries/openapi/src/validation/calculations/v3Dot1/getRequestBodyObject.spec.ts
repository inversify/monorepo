import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import {
  type OpenApi3Dot1OperationObject,
  type OpenApi3Dot1RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import { getRequestBodyObject } from './getRequestBodyObject.js';

describe(getRequestBodyObject, () => {
  let openApiResolverMock: OpenApiResolver;
  let methodFixture: string;
  let routeFixture: string;

  beforeAll(() => {
    openApiResolverMock = {
      deepResolveReference: vitest.fn(),
      resolveReference: vitest.fn(),
    };
    methodFixture = 'post';
    routeFixture = '/users';
  });

  describe('having an operationObject with no requestBody', () => {
    let operationObjectFixture: OpenApi3Dot1OperationObject;

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
    let operationObjectFixture: OpenApi3Dot1OperationObject;
    let requestBodyObjectFixture: OpenApi3Dot1RequestBodyObject;

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

      it('should return expected result', () => {
        expect(result).toBe(requestBodyObjectFixture);
      });
    });
  });

  describe('having an operationObject with requestBody with $ref resolving to undefined', () => {
    let operationObjectFixture: OpenApi3Dot1OperationObject;
    let refFixture: string;

    beforeAll(() => {
      refFixture = '#/components/requestBodies/UserBody';
      operationObjectFixture = {
        requestBody: {
          $ref: refFixture,
        },
        responses: {},
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(openApiResolverMock.deepResolveReference)
          .mockReturnValueOnce(undefined);

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

      it('should call openApiResolver.deepResolveReference()', () => {
        expect(
          openApiResolverMock.deepResolveReference,
        ).toHaveBeenCalledExactlyOnceWith(refFixture);
      });

      it('should throw an InversifyValidationError', () => {
        const expectedErrorProperties: Partial<InversifyValidationError> = {
          kind: InversifyValidationErrorKind.validationFailed,
          message: `Could not resolve $ref pointer ${refFixture} for ${methodFixture.toUpperCase()} ${routeFixture}`,
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having an operationObject with requestBody with $ref resolving to null', () => {
    let operationObjectFixture: OpenApi3Dot1OperationObject;
    let refFixture: string;

    beforeAll(() => {
      refFixture = '#/components/requestBodies/UserBody';
      operationObjectFixture = {
        requestBody: {
          $ref: refFixture,
        },
        responses: {},
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(openApiResolverMock.deepResolveReference)
          .mockReturnValueOnce(null);

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

      it('should call openApiResolver.deepResolveReference()', () => {
        expect(
          openApiResolverMock.deepResolveReference,
        ).toHaveBeenCalledExactlyOnceWith(refFixture);
      });

      it('should throw an InversifyValidationError', () => {
        const expectedErrorProperties: Partial<InversifyValidationError> = {
          kind: InversifyValidationErrorKind.validationFailed,
          message: `Resolved $ref pointer ${refFixture} is not a valid request body object for ${methodFixture.toUpperCase()} ${routeFixture}`,
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having an operationObject with requestBody with $ref resolving to an array', () => {
    let operationObjectFixture: OpenApi3Dot1OperationObject;
    let refFixture: string;

    beforeAll(() => {
      refFixture = '#/components/requestBodies/UserBody';
      operationObjectFixture = {
        requestBody: {
          $ref: refFixture,
        },
        responses: {},
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(openApiResolverMock.deepResolveReference)
          .mockReturnValueOnce([]);

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

      it('should call openApiResolver.deepResolveReference()', () => {
        expect(
          openApiResolverMock.deepResolveReference,
        ).toHaveBeenCalledExactlyOnceWith(refFixture);
      });

      it('should throw an InversifyValidationError', () => {
        const expectedErrorProperties: Partial<InversifyValidationError> = {
          kind: InversifyValidationErrorKind.validationFailed,
          message: `Resolved $ref pointer ${refFixture} is not a valid request body object for ${methodFixture.toUpperCase()} ${routeFixture}`,
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having an operationObject with requestBody with $ref resolving to a valid object', () => {
    let operationObjectFixture: OpenApi3Dot1OperationObject;
    let refFixture: string;
    let resolvedObjectFixture: OpenApi3Dot1RequestBodyObject;

    beforeAll(() => {
      refFixture = '#/components/requestBodies/UserBody';
      resolvedObjectFixture = {
        content: {
          'application/json': {},
        },
      };
      operationObjectFixture = {
        requestBody: {
          $ref: refFixture,
        },
        responses: {},
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(openApiResolverMock.deepResolveReference)
          .mockReturnValueOnce(
            resolvedObjectFixture as unknown as ReturnType<
              typeof openApiResolverMock.deepResolveReference
            >,
          );

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

      it('should call openApiResolver.deepResolveReference()', () => {
        expect(
          openApiResolverMock.deepResolveReference,
        ).toHaveBeenCalledExactlyOnceWith(refFixture);
      });

      it('should return expected result', () => {
        expect(result).toBe(resolvedObjectFixture);
      });
    });
  });
});
