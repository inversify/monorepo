import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./maybeCoerceStringToNonNullableNumber.js'));

import { maybeCoerceStringOrStringArrayToNonNullableNumber } from './maybeCoerceStringOrStringArrayToNonNullableNumber.js';
import { maybeCoerceStringToNonNullableNumber } from './maybeCoerceStringToNonNullableNumber.js';

describe(maybeCoerceStringOrStringArrayToNonNullableNumber, () => {
  afterAll(() => {
    vitest.restoreAllMocks();
  });

  describe('having a string value', () => {
    let resultFixture: unknown;

    beforeAll(() => {
      resultFixture = Symbol();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(maybeCoerceStringToNonNullableNumber)
          .mockReturnValueOnce(resultFixture as number);

        result = maybeCoerceStringOrStringArrayToNonNullableNumber('3.14');
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNonNullableNumber', () => {
        expect(
          maybeCoerceStringToNonNullableNumber,
        ).toHaveBeenCalledExactlyOnceWith('3.14');
      });

      it('should return the expected result', () => {
        expect(result).toBe(resultFixture);
      });
    });
  });

  describe('having a string array value', () => {
    let resultFixtureFirst: unknown;
    let resultFixtureSecond: unknown;

    beforeAll(() => {
      resultFixtureFirst = Symbol();
      resultFixtureSecond = Symbol();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(maybeCoerceStringToNonNullableNumber)
          .mockReturnValueOnce(resultFixtureFirst as number)
          .mockReturnValueOnce(resultFixtureSecond as number);

        result = maybeCoerceStringOrStringArrayToNonNullableNumber([
          '3.14',
          '2.71',
        ]);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNonNullableNumber for each element', () => {
        expect(maybeCoerceStringToNonNullableNumber).toHaveBeenCalledTimes(2);
        expect(maybeCoerceStringToNonNullableNumber).toHaveBeenNthCalledWith(
          1,
          '3.14',
        );
        expect(maybeCoerceStringToNonNullableNumber).toHaveBeenNthCalledWith(
          2,
          '2.71',
        );
      });

      it('should return the expected result', () => {
        expect(result).toStrictEqual([resultFixtureFirst, resultFixtureSecond]);
      });
    });
  });

  describe('having an undefined value', () => {
    let resultFixture: unknown;

    beforeAll(() => {
      resultFixture = Symbol();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(maybeCoerceStringToNonNullableNumber)
          .mockReturnValueOnce(resultFixture as number);

        result = maybeCoerceStringOrStringArrayToNonNullableNumber(undefined);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNonNullableNumber', () => {
        expect(
          maybeCoerceStringToNonNullableNumber,
        ).toHaveBeenCalledExactlyOnceWith(undefined);
      });

      it('should return the expected result', () => {
        expect(result).toBe(resultFixture);
      });
    });
  });
});
