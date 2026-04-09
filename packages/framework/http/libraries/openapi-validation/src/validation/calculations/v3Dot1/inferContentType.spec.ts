import { beforeAll, describe, expect, it } from 'vitest';

import { type OpenApi3Dot1RequestBodyObject } from '@inversifyjs/open-api-types/v3Dot1';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { inferContentType } from './inferContentType.js';

describe(inferContentType, () => {
  describe('having a requestBodyObject with exactly one content type', () => {
    let requestBodyObjectFixture: OpenApi3Dot1RequestBodyObject;
    let methodFixture: string;

    beforeAll(() => {
      methodFixture = 'post';
      requestBodyObjectFixture = {
        content: {
          'application/json': {},
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = inferContentType(requestBodyObjectFixture, methodFixture);
      });

      it('should return expected result', () => {
        expect(result).toBe('application/json');
      });
    });
  });

  describe('having a requestBodyObject with multiple content types', () => {
    let requestBodyObjectFixture: OpenApi3Dot1RequestBodyObject;
    let methodFixture: string;

    beforeAll(() => {
      methodFixture = 'post';
      requestBodyObjectFixture = {
        content: {
          'application/json': {},
          'application/xml': {},
        },
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          inferContentType(requestBodyObjectFixture, methodFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an InversifyValidationError', () => {
        const expectedErrorProperties: Partial<InversifyValidationError> = {
          kind: InversifyValidationErrorKind.validationFailed,
          message: `Cannot determine content type for request body validation for method ${methodFixture}: no content type provided and multiple content types defined in OpenAPI spec (application/json, application/xml)`,
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });
});
