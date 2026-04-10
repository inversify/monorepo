import { beforeAll, describe, expect, it } from 'vitest';

import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { getPathItemObject } from './getPathItemObject.js';

describe(getPathItemObject, () => {
  describe('having an openApiObject with paths containing the path', () => {
    let openApiObjectFixture: OpenApi3Dot1Object;
    let pathFixture: string;

    beforeAll(() => {
      pathFixture = '/users';
      openApiObjectFixture = {
        info: { title: 'Test', version: '1.0.0' },
        openapi: '3.1.0',
        paths: {
          [pathFixture]: {
            get: {
              responses: {},
            },
          },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getPathItemObject(openApiObjectFixture, pathFixture);
      });

      it('should return expected result', () => {
        expect(result).toStrictEqual(openApiObjectFixture.paths?.[pathFixture]);
      });
    });
  });

  describe('having an openApiObject with no paths', () => {
    let openApiObjectFixture: OpenApi3Dot1Object;
    let pathFixture: string;

    beforeAll(() => {
      pathFixture = '/users';
      openApiObjectFixture = {
        info: { title: 'Test', version: '1.0.0' },
        openapi: '3.1.0',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          getPathItemObject(openApiObjectFixture, pathFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an InversifyValidationError', () => {
        const expectedErrorProperties: Partial<InversifyValidationError> = {
          kind: InversifyValidationErrorKind.validationFailed,
          message: `Path ${pathFixture} not found`,
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });

  describe('having an openApiObject with paths not containing the path', () => {
    let openApiObjectFixture: OpenApi3Dot1Object;
    let pathFixture: string;

    beforeAll(() => {
      pathFixture = '/users';
      openApiObjectFixture = {
        info: { title: 'Test', version: '1.0.0' },
        openapi: '3.1.0',
        paths: {
          '/other': {
            get: {
              responses: {},
            },
          },
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          getPathItemObject(openApiObjectFixture, pathFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an InversifyValidationError', () => {
        expect(result).toBeInstanceOf(InversifyValidationError);
      });

      it('should throw an error with validationFailed kind', () => {
        expect((result as InversifyValidationError).kind).toBe(
          InversifyValidationErrorKind.validationFailed,
        );
      });

      it('should throw an error with expected message', () => {
        expect((result as InversifyValidationError).message).toBe(
          `Path ${pathFixture} not found`,
        );
      });
    });
  });
});
