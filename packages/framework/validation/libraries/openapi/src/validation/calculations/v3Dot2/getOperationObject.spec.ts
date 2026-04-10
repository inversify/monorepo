import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./getPathItemObject.js'));

import {
  type OpenApi3Dot2Object,
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2PathItemObject,
} from '@inversifyjs/open-api-types/v3Dot2';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { getOperationObject } from './getOperationObject.js';
import { getPathItemObject } from './getPathItemObject.js';

describe(getOperationObject, () => {
  describe('having a pathItemObject with the method', () => {
    let openApiObjectFixture: OpenApi3Dot2Object;
    let methodFixture: string;
    let pathFixture: string;
    let operationObjectFixture: OpenApi3Dot2OperationObject;
    let pathItemObjectFixture: OpenApi3Dot2PathItemObject;

    beforeAll(() => {
      methodFixture = 'get';
      pathFixture = '/users';
      operationObjectFixture = {
        responses: {},
      };
      pathItemObjectFixture = {
        [methodFixture]: operationObjectFixture,
      };
      openApiObjectFixture = Symbol() as unknown as OpenApi3Dot2Object;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(getPathItemObject)
          .mockReturnValueOnce(pathItemObjectFixture);

        result = getOperationObject(
          openApiObjectFixture,
          methodFixture,
          pathFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getPathItemObject()', () => {
        expect(getPathItemObject).toHaveBeenCalledExactlyOnceWith(
          openApiObjectFixture,
          pathFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(operationObjectFixture);
      });
    });
  });

  describe('having a pathItemObject without the method', () => {
    let openApiObjectFixture: OpenApi3Dot2Object;
    let methodFixture: string;
    let pathFixture: string;
    let pathItemObjectFixture: OpenApi3Dot2PathItemObject;

    beforeAll(() => {
      methodFixture = 'post';
      pathFixture = '/users';
      pathItemObjectFixture = {
        get: {
          responses: {},
        },
      };
      openApiObjectFixture = Symbol() as unknown as OpenApi3Dot2Object;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(getPathItemObject)
          .mockReturnValueOnce(pathItemObjectFixture);

        try {
          getOperationObject(openApiObjectFixture, methodFixture, pathFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getPathItemObject()', () => {
        expect(getPathItemObject).toHaveBeenCalledExactlyOnceWith(
          openApiObjectFixture,
          pathFixture,
        );
      });

      it('should throw an InversifyValidationError', () => {
        const expectedErrorProperties: Partial<InversifyValidationError> = {
          kind: InversifyValidationErrorKind.validationFailed,
          message: `No OpenAPI operation found for method ${methodFixture} for path ${pathFixture}`,
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });
});
