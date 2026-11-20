import { beforeAll, describe, expect, it } from 'vitest';

import { isNullTerminus } from './isNullTerminus.js';

describe(isNullTerminus, () => {
  describe.each<[string, unknown, boolean]>([
    ['null', null, true],
    ['undefined', undefined, true],
    ['a typed null', { type: {}, value: null }, true],
    ['a described terminus', { value: [{ value: 'orders.create' }] }, false],
    ['a plain terminus', { address: 'orders.create' }, false],
  ])(
    'having %s',
    (_: string, terminusFixture: unknown, expectedResult: boolean) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = isNullTerminus(terminusFixture);
        });

        it(`should return ${String(expectedResult)}`, () => {
          expect(result).toBe(expectedResult);
        });
      });
    },
  );
});
