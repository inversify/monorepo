import { beforeAll, describe, expect, it } from 'vitest';

import { getFirstIteratorResult } from './getFirstIteratorResult';

describe(getFirstIteratorResult.name, () => {
  describe.each<[string, Iterator<unknown> | undefined, unknown]>([
    ['undefined', undefined, undefined],
    ['empty iterator', [][Symbol.iterator](), undefined],
    ['non empty iterator', [true, false][Symbol.iterator](), true],
  ])(
    'having %s value',
    (
      _: string,
      inputFixture: Iterator<unknown> | undefined,
      expectedValue: unknown,
    ): void => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = getFirstIteratorResult(inputFixture);
        });

        it('should return expected value', () => {
          expect(result).toStrictEqual(expectedValue);
        });
      });
    },
  );
});
