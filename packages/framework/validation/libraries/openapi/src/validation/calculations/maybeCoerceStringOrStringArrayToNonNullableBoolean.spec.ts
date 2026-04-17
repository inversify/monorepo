import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./maybeCoerceStringToNonNullableBoolean.js'));

import { maybeCoerceStringOrStringArrayToNonNullableBoolean } from './maybeCoerceStringOrStringArrayToNonNullableBoolean.js';
import { maybeCoerceStringToNonNullableBoolean } from './maybeCoerceStringToNonNullableBoolean.js';

describe(maybeCoerceStringOrStringArrayToNonNullableBoolean, () => {
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
          .mocked(maybeCoerceStringToNonNullableBoolean)
          .mockReturnValueOnce(resultFixture as boolean);

        result = maybeCoerceStringOrStringArrayToNonNullableBoolean('true');
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNonNullableBoolean', () => {
        expect(
          maybeCoerceStringToNonNullableBoolean,
        ).toHaveBeenCalledExactlyOnceWith('true');
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
          .mocked(maybeCoerceStringToNonNullableBoolean)
          .mockReturnValueOnce(resultFixtureFirst as boolean)
          .mockReturnValueOnce(resultFixtureSecond as boolean);

        result = maybeCoerceStringOrStringArrayToNonNullableBoolean([
          'true',
          'false',
        ]);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNonNullableBoolean for each element', () => {
        expect(maybeCoerceStringToNonNullableBoolean).toHaveBeenCalledTimes(2);
        expect(maybeCoerceStringToNonNullableBoolean).toHaveBeenNthCalledWith(
          1,
          'true',
        );
        expect(maybeCoerceStringToNonNullableBoolean).toHaveBeenNthCalledWith(
          2,
          'false',
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
          .mocked(maybeCoerceStringToNonNullableBoolean)
          .mockReturnValueOnce(resultFixture as boolean);

        result = maybeCoerceStringOrStringArrayToNonNullableBoolean(undefined);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNonNullableBoolean', () => {
        expect(
          maybeCoerceStringToNonNullableBoolean,
        ).toHaveBeenCalledExactlyOnceWith(undefined);
      });

      it('should return the expected result', () => {
        expect(result).toBe(resultFixture);
      });
    });
  });
});
