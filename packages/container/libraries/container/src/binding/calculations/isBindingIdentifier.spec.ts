import { beforeAll, describe, expect, it } from 'vitest';

import { isBindingIdentifier } from './isBindingIdentifier.js';

describe(isBindingIdentifier, () => {
  describe.each<[string, unknown, boolean]>([
    ['undefined', undefined, false],
    ['null', null, false],
    ['a boolean', true, false],
    ['a number', 1, false],
    ['a string', 'string', false],
    ['a symbol', Symbol('symbol'), false],
    ['an object', {}, false],
    ['an object with a different symbol', { [Symbol('symbol')]: true }, false],
    [
      'an object with the binding identifier symbol',
      { [Symbol.for('@inversifyjs/container/bindingIdentifier')]: true },
      true,
    ],
  ])(
    'having %s',
    (_: string, valueFixture: unknown, expectedResult: boolean) => {
      let result: unknown;

      beforeAll(() => {
        result = isBindingIdentifier(valueFixture);
      });

      it('should return the expected result', () => {
        expect(result).toBe(expectedResult);
      });
    },
  );
});
