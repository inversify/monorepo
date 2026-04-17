import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./maybeCoerceStringOrStringArrayToNonNullableBoolean.js'));
vitest.mock(import('./maybeCoerceStringOrStringArrayToNonNullableNumber.js'));
vitest.mock(import('./maybeCoerceStringOrStringArrayToNull.js'));
vitest.mock(import('./maybeCoerceStringOrStringArrayToNullableBoolean.js'));
vitest.mock(import('./maybeCoerceStringOrStringArrayToNullableNumber.js'));

import { InversifyValidationError } from '@inversifyjs/validation-common';

import { buildNonArrayHeaderParse } from './buildNonArrayHeaderParse.js';
import { maybeCoerceStringOrStringArrayToNonNullableBoolean } from './maybeCoerceStringOrStringArrayToNonNullableBoolean.js';
import { maybeCoerceStringOrStringArrayToNonNullableNumber } from './maybeCoerceStringOrStringArrayToNonNullableNumber.js';
import { maybeCoerceStringOrStringArrayToNull } from './maybeCoerceStringOrStringArrayToNull.js';
import { maybeCoerceStringOrStringArrayToNullableBoolean } from './maybeCoerceStringOrStringArrayToNullableBoolean.js';
import { maybeCoerceStringOrStringArrayToNullableNumber } from './maybeCoerceStringOrStringArrayToNullableNumber.js';

describe(buildNonArrayHeaderParse, () => {
  afterAll(() => {
    vitest.restoreAllMocks();
  });

  describe.each<[string, boolean, string, () => unknown]>([
    [
      'type is "boolean" and isNullable is false',
      false,
      'boolean',
      () => maybeCoerceStringOrStringArrayToNonNullableBoolean,
    ],
    [
      'type is "boolean" and isNullable is true',
      true,
      'boolean',
      () => maybeCoerceStringOrStringArrayToNullableBoolean,
    ],
    [
      'type is "integer" and isNullable is false',
      false,
      'integer',
      () => maybeCoerceStringOrStringArrayToNonNullableNumber,
    ],
    [
      'type is "integer" and isNullable is true',
      true,
      'integer',
      () => maybeCoerceStringOrStringArrayToNullableNumber,
    ],
    [
      'type is "number" and isNullable is false',
      false,
      'number',
      () => maybeCoerceStringOrStringArrayToNonNullableNumber,
    ],
    [
      'type is "number" and isNullable is true',
      true,
      'number',
      () => maybeCoerceStringOrStringArrayToNullableNumber,
    ],
    [
      'type is "null"',
      false,
      'null',
      () => maybeCoerceStringOrStringArrayToNull,
    ],
  ])(
    'having %s',
    (
      _: string,
      isNullable: boolean,
      type: string,
      expectedFn: () => unknown,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = buildNonArrayHeaderParse(
            isNullable,
            'test-ref',
            type as Parameters<typeof buildNonArrayHeaderParse>[2],
          );
        });

        it('should return the expected parse function', () => {
          expect(result).toBe(expectedFn());
        });
      });
    },
  );

  describe('having type is "string"', () => {
    describe('when called', () => {
      let result: (value: string | string[] | undefined) => unknown;

      beforeAll(() => {
        result = buildNonArrayHeaderParse(false, 'test-ref', 'string');
      });

      it('should return a function that returns the value as-is', () => {
        expect(result('hello')).toBe('hello');
      });
    });
  });

  describe('having an unsupported type', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          buildNonArrayHeaderParse(
            false,
            'test-ref',
            'object' as Parameters<typeof buildNonArrayHeaderParse>[2],
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an InversifyValidationError', () => {
        expect(result).toBeInstanceOf(InversifyValidationError);
      });

      it('should throw with an unsupported type message', () => {
        expect((result as InversifyValidationError).message).toBe(
          'Unsupported header parameter "test-ref" type: "object"',
        );
      });
    });
  });
});
