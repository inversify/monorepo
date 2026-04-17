import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./maybeCoerceStringToNull.js'));

import { maybeCoerceStringOrStringArrayToNull } from './maybeCoerceStringOrStringArrayToNull.js';
import { maybeCoerceStringToNull } from './maybeCoerceStringToNull.js';

describe(maybeCoerceStringOrStringArrayToNull, () => {
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
          .mocked(maybeCoerceStringToNull)
          .mockReturnValueOnce(resultFixture as null);

        result = maybeCoerceStringOrStringArrayToNull('');
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNull', () => {
        expect(maybeCoerceStringToNull).toHaveBeenCalledExactlyOnceWith('');
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
          .mocked(maybeCoerceStringToNull)
          .mockReturnValueOnce(resultFixtureFirst as null)
          .mockReturnValueOnce(resultFixtureSecond as null);

        result = maybeCoerceStringOrStringArrayToNull(['', 'hello']);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNull for each element', () => {
        expect(maybeCoerceStringToNull).toHaveBeenCalledTimes(2);
        expect(maybeCoerceStringToNull).toHaveBeenNthCalledWith(1, '');
        expect(maybeCoerceStringToNull).toHaveBeenNthCalledWith(2, 'hello');
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
          .mocked(maybeCoerceStringToNull)
          .mockReturnValueOnce(resultFixture as null);

        result = maybeCoerceStringOrStringArrayToNull(undefined);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call maybeCoerceStringToNull', () => {
        expect(maybeCoerceStringToNull).toHaveBeenCalledExactlyOnceWith(
          undefined,
        );
      });

      it('should return the expected result', () => {
        expect(result).toBe(resultFixture);
      });
    });
  });
});
