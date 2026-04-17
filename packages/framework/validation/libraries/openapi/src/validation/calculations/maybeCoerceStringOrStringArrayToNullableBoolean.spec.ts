import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./maybeCoerceStringToNullableBoolean.js'));

import { maybeCoerceStringOrStringArrayToNullableBoolean } from './maybeCoerceStringOrStringArrayToNullableBoolean.js';
import { maybeCoerceStringToNullableBoolean } from './maybeCoerceStringToNullableBoolean.js';

describe(maybeCoerceStringOrStringArrayToNullableBoolean, () => {
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
          .mocked(maybeCoerceStringToNullableBoolean)
          .mockReturnValueOnce(resultFixture as boolean);

        result = maybeCoerceStringOrStringArrayToNullableBoolean('true');
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNullableBoolean', () => {
        expect(
          maybeCoerceStringToNullableBoolean,
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
          .mocked(maybeCoerceStringToNullableBoolean)
          .mockReturnValueOnce(resultFixtureFirst as boolean)
          .mockReturnValueOnce(resultFixtureSecond as boolean);

        result = maybeCoerceStringOrStringArrayToNullableBoolean([
          'true',
          'false',
        ]);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNullableBoolean for each element', () => {
        expect(maybeCoerceStringToNullableBoolean).toHaveBeenCalledTimes(2);
        expect(maybeCoerceStringToNullableBoolean).toHaveBeenNthCalledWith(
          1,
          'true',
        );
        expect(maybeCoerceStringToNullableBoolean).toHaveBeenNthCalledWith(
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
          .mocked(maybeCoerceStringToNullableBoolean)
          .mockReturnValueOnce(resultFixture as boolean);

        result = maybeCoerceStringOrStringArrayToNullableBoolean(undefined);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNullableBoolean', () => {
        expect(
          maybeCoerceStringToNullableBoolean,
        ).toHaveBeenCalledExactlyOnceWith(undefined);
      });

      it('should return the expected result', () => {
        expect(result).toBe(resultFixture);
      });
    });
  });
});
