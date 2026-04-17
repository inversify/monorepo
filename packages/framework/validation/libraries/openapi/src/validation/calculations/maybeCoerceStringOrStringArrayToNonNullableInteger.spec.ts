import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./maybeCoerceStringToNonNullableInteger.js'));

import { maybeCoerceStringOrStringArrayToNonNullableInteger } from './maybeCoerceStringOrStringArrayToNonNullableInteger.js';
import { maybeCoerceStringToNonNullableInteger } from './maybeCoerceStringToNonNullableInteger.js';

describe(maybeCoerceStringOrStringArrayToNonNullableInteger, () => {
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
          .mocked(maybeCoerceStringToNonNullableInteger)
          .mockReturnValueOnce(resultFixture as number);

        result = maybeCoerceStringOrStringArrayToNonNullableInteger('42');
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNonNullableInteger', () => {
        expect(
          maybeCoerceStringToNonNullableInteger,
        ).toHaveBeenCalledExactlyOnceWith('42');
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
          .mocked(maybeCoerceStringToNonNullableInteger)
          .mockReturnValueOnce(resultFixtureFirst as number)
          .mockReturnValueOnce(resultFixtureSecond as number);

        result = maybeCoerceStringOrStringArrayToNonNullableInteger([
          '42',
          '7',
        ]);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNonNullableInteger for each element', () => {
        expect(maybeCoerceStringToNonNullableInteger).toHaveBeenCalledTimes(2);
        expect(maybeCoerceStringToNonNullableInteger).toHaveBeenNthCalledWith(
          1,
          '42',
        );
        expect(maybeCoerceStringToNonNullableInteger).toHaveBeenNthCalledWith(
          2,
          '7',
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
          .mocked(maybeCoerceStringToNonNullableInteger)
          .mockReturnValueOnce(resultFixture as number);

        result = maybeCoerceStringOrStringArrayToNonNullableInteger(undefined);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNonNullableInteger', () => {
        expect(
          maybeCoerceStringToNonNullableInteger,
        ).toHaveBeenCalledExactlyOnceWith(undefined);
      });

      it('should return the expected result', () => {
        expect(result).toBe(resultFixture);
      });
    });
  });
});
