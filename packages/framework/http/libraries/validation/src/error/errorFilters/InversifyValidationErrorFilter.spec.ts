import { beforeAll, describe, expect, it } from 'vitest';

import { BadRequestHttpResponse } from '@inversifyjs/http-core';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { InversifyValidationErrorFilter } from './InversifyValidationErrorFilter.js';

describe(InversifyValidationErrorFilter, () => {
  let inversifyValidationErrorFilter: InversifyValidationErrorFilter;

  beforeAll(() => {
    inversifyValidationErrorFilter = new InversifyValidationErrorFilter();
  });

  describe('.catch', () => {
    describe('having an InversifyValidationError with kind "validationFailed"', () => {
      let errorFixture: InversifyValidationError;

      beforeAll(() => {
        errorFixture = new InversifyValidationError(
          InversifyValidationErrorKind.validationFailed,
          'message',
        );
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            inversifyValidationErrorFilter.catch(errorFixture);
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw a BadRequestHttpResponse', () => {
          const expectedErrorProperties: Partial<BadRequestHttpResponse> = {
            cause: errorFixture,

            message: errorFixture.message,
          };

          expect(result).toBeInstanceOf(BadRequestHttpResponse);
          expect(result).toMatchObject(expectedErrorProperties);
        });
      });
    });

    describe('having an InversifyValidationError with kind "unknown"', () => {
      let errorFixture: InversifyValidationError;

      beforeAll(() => {
        errorFixture = new InversifyValidationError(
          InversifyValidationErrorKind.unknown,
          'message',
        );
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            inversifyValidationErrorFilter.catch(errorFixture);
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an Error', () => {
          const expectedErrorProperties: Partial<Error> = {
            cause: errorFixture,
            message: errorFixture.message,
          };

          expect(result).toBeInstanceOf(Error);
          expect(result).toMatchObject(expectedErrorProperties);
        });
      });
    });
  });
});
