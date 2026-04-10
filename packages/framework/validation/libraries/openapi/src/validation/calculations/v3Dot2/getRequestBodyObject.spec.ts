import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('@inversifyjs/json-schema-pointer'));

import { resolveJsonPointer } from '@inversifyjs/json-schema-pointer';
import {
  type OpenApi3Dot2Object,
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot2';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { getRequestBodyObject } from './getRequestBodyObject.js';

describe(getRequestBodyObject, () => {
  let openApiObjectFixture: OpenApi3Dot2Object;
  let methodFixture: string;
  let pathFixture: string;

  beforeAll(() => {
    openApiObjectFixture = Symbol() as unknown as OpenApi3Dot2Object;
    methodFixture = 'post';
    pathFixture = '/users';
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
            openApiObjectFixture,
            operationObjectFixture,
            methodFixture,
            pathFixture,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an InversifyValidationError', () => {
        const expectedErrorProperties: Partial<InversifyValidationError> = {
          kind: InversifyValidationErrorKind.validationFailed,
          message: `No requestBody found for method ${methodFixture} for path ${pathFixture}`,
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
          openApiObjectFixture,
          operationObjectFixture,
          methodFixture,
          pathFixture,
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
        vitest.mocked(resolveJsonPointer).mockReturnValueOnce(undefined);

        try {
          getRequestBodyObject(
            openApiObjectFixture,
            operationObjectFixture,
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

      it('should call resolveJsonPointer()', () => {
        expect(resolveJsonPointer).toHaveBeenCalledExactlyOnceWith(
          openApiObjectFixture,
          refFixture,
        );
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
        vitest.mocked(resolveJsonPointer).mockReturnValueOnce(null);

        try {
          getRequestBodyObject(
            openApiObjectFixture,
            operationObjectFixture,
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

      it('should call resolveJsonPointer()', () => {
        expect(resolveJsonPointer).toHaveBeenCalledExactlyOnceWith(
          openApiObjectFixture,
          refFixture,
        );
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
        vitest.mocked(resolveJsonPointer).mockReturnValueOnce([]);

        try {
          getRequestBodyObject(
            openApiObjectFixture,
            operationObjectFixture,
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

      it('should call resolveJsonPointer()', () => {
        expect(resolveJsonPointer).toHaveBeenCalledExactlyOnceWith(
          openApiObjectFixture,
          refFixture,
        );
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
          .mocked(resolveJsonPointer)
          .mockReturnValueOnce(
            resolvedObjectFixture as unknown as ReturnType<
              typeof resolveJsonPointer
            >,
          );

        result = getRequestBodyObject(
          openApiObjectFixture,
          operationObjectFixture,
          methodFixture,
          pathFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveJsonPointer()', () => {
        expect(resolveJsonPointer).toHaveBeenCalledExactlyOnceWith(
          openApiObjectFixture,
          refFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(resolvedObjectFixture);
      });
    });
  });
});
