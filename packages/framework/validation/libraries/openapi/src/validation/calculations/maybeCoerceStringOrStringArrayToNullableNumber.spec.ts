import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./maybeCoerceStringToNullableNumber.js'));

import { maybeCoerceStringOrStringArrayToNullableNumber } from './maybeCoerceStringOrStringArrayToNullableNumber.js';
import { maybeCoerceStringToNullableNumber } from './maybeCoerceStringToNullableNumber.js';

describe(maybeCoerceStringOrStringArrayToNullableNumber, () => {
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
          .mocked(maybeCoerceStringToNullableNumber)
          .mockReturnValueOnce(resultFixture as number);

        result = maybeCoerceStringOrStringArrayToNullableNumber('3.14');
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNullableNumber', () => {
        expect(
          maybeCoerceStringToNullableNumber,
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
          .mocked(maybeCoerceStringToNullableNumber)
          .mockReturnValueOnce(resultFixtureFirst as number)
          .mockReturnValueOnce(resultFixtureSecond as number);

        result = maybeCoerceStringOrStringArrayToNullableNumber([
          '3.14',
          '2.71',
        ]);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNullableNumber for each element', () => {
        expect(maybeCoerceStringToNullableNumber).toHaveBeenCalledTimes(2);
        expect(maybeCoerceStringToNullableNumber).toHaveBeenNthCalledWith(
          1,
          '3.14',
        );
        expect(maybeCoerceStringToNullableNumber).toHaveBeenNthCalledWith(
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
          .mocked(maybeCoerceStringToNullableNumber)
          .mockReturnValueOnce(resultFixture as number);

        result = maybeCoerceStringOrStringArrayToNullableNumber(undefined);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNullableNumber', () => {
        expect(
          maybeCoerceStringToNullableNumber,
        ).toHaveBeenCalledExactlyOnceWith(undefined);
      });

      it('should return the expected result', () => {
        expect(result).toBe(resultFixture);
      });
    });
  });
});
