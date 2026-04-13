import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import {
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot2';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { type BodyValidationInputParam } from '../../models/BodyValidationInputParam.js';
import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import { getRequestBodyObject } from './getRequestBodyObject.js';

describe(getRequestBodyObject, () => {
  let openApiResolverMock: OpenApiResolver;
  let inputParamFixture: BodyValidationInputParam<unknown>;

  beforeAll(() => {
    openApiResolverMock = {
      deepResolveReference: vitest.fn(),
      resolveReference: vitest.fn(),
    };
    inputParamFixture = {
      body: { name: 'test' },
      contentType: 'application/json',
      method: 'post',
      path: '/users',
      type: Symbol() as unknown as BodyValidationInputParam<unknown>['type'],
    };
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
            inputParamFixture,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an InversifyValidationError', () => {
        const expectedErrorProperties: Partial<InversifyValidationError> = {
          kind: InversifyValidationErrorKind.validationFailed,
          message: `No requestBody found for method ${inputParamFixture.method} for path ${inputParamFixture.path}`,
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
          inputParamFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(requestBodyObjectFixture);
      });
    });
  });

  describe('having an operationObject with requestBody with $ref resolving to undefined', () => {
    let operationObjectFixture: OpenApi3Dot2OperationObject;
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
            inputParamFixture,
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
          message: `Could not resolve $ref pointer ${refFixture}`,
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having an operationObject with requestBody with $ref resolving to null', () => {
    let operationObjectFixture: OpenApi3Dot2OperationObject;
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
            inputParamFixture,
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
          message: `Resolved $ref pointer ${refFixture} is not a valid object`,
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having an operationObject with requestBody with $ref resolving to an array', () => {
    let operationObjectFixture: OpenApi3Dot2OperationObject;
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
            inputParamFixture,
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
          message: `Resolved $ref pointer ${refFixture} is not a valid object`,
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having an operationObject with requestBody with $ref resolving to a valid object', () => {
    let operationObjectFixture: OpenApi3Dot2OperationObject;
    let refFixture: string;
    let resolvedObjectFixture: OpenApi3Dot2RequestBodyObject;

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
          inputParamFixture,
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
