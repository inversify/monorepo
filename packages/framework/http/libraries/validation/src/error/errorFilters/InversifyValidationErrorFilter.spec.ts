import { beforeAll, describe, expect, it } from 'vitest';

import { BadRequestHttpResponse } from '@inversifyjs/http-core';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';

import { InversifyValidationErrorFilter } from './InversifyValidationErrorFilter';

describe(InversifyValidationErrorFilter, () => {
  let inversifyValidationErrorFilter: InversifyValidationErrorFilter;

  beforeAll(() => {
    inversifyValidationErrorFilter = new InversifyValidationErrorFilter();
  });

  describe('.catch', () => {
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
});
