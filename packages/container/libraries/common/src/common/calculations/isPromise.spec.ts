import { beforeAll, describe, expect, it } from 'vitest';

import { isPromise } from './isPromise';

describe(isPromise.name, () => {
  describe.each<[string, unknown, boolean]>([
    ['null', null, false],
    ['a string', 'string-fixture', false],
    ['a function with no "then" property', () => undefined, false],
    ['an object with no "then" property', {}, false],
    [
      'a function with non function "then" property',
      (() => {
        const value: (() => void) & {
          then?: unknown;
        } = () => undefined;

        value.then = 'fixture';

        return value;
      })(),
      false,
    ],
    ['an object with non function "then" property', { then: 'fixture' }, false],
    [
      'a function with function "then" property',
      (() => {
        const value: (() => void) & {
          then?: unknown;
        } = () => undefined;

        value.then = () => undefined;

        return value;
      })(),
      true,
    ],
    [
      'an object with function "then" property',
      { then: () => undefined },
      true,
    ],
  ])('having %s', (_: string, value: unknown, expectedResult: boolean) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isPromise(value);
      });

      it('should return expected value', () => {
        expect(result).toBe(expectedResult);
      });
    });
  });
});
