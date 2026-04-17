import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./maybeCoerceStringToNullableInteger.js'));

import { maybeCoerceStringOrStringArrayToNullableInteger } from './maybeCoerceStringOrStringArrayToNullableInteger.js';
import { maybeCoerceStringToNullableInteger } from './maybeCoerceStringToNullableInteger.js';

describe(maybeCoerceStringOrStringArrayToNullableInteger, () => {
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
          .mocked(maybeCoerceStringToNullableInteger)
          .mockReturnValueOnce(resultFixture as number);

        result = maybeCoerceStringOrStringArrayToNullableInteger('42');
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNullableInteger', () => {
        expect(
          maybeCoerceStringToNullableInteger,
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
          .mocked(maybeCoerceStringToNullableInteger)
          .mockReturnValueOnce(resultFixtureFirst as number)
          .mockReturnValueOnce(resultFixtureSecond as number);

        result = maybeCoerceStringOrStringArrayToNullableInteger(['42', '7']);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNullableInteger for each element', () => {
        expect(maybeCoerceStringToNullableInteger).toHaveBeenCalledTimes(2);
        expect(maybeCoerceStringToNullableInteger).toHaveBeenNthCalledWith(
          1,
          '42',
        );
        expect(maybeCoerceStringToNullableInteger).toHaveBeenNthCalledWith(
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
          .mocked(maybeCoerceStringToNullableInteger)
          .mockReturnValueOnce(resultFixture as number);

        result = maybeCoerceStringOrStringArrayToNullableInteger(undefined);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNullableInteger', () => {
        expect(
          maybeCoerceStringToNullableInteger,
        ).toHaveBeenCalledExactlyOnceWith(undefined);
      });

      it('should return the expected result', () => {
        expect(result).toBe(resultFixture);
      });
    });
  });
});
