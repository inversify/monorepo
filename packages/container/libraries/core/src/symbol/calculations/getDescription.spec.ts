import { beforeAll, describe, expect, it } from 'vitest';

import { getDescription } from './getDescription';

describe(getDescription.name, () => {
  describe.each<[string, symbol, string]>([
    ['with no description', Symbol(), ''],
    ['with description', Symbol('description'), 'description'],
    ['with description', Symbol.for('description'), 'description'],
  ])(
    'having a symbol %s',
    (_: string, symbolFixture: symbol, expectedResult: string) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = getDescription(symbolFixture);
        });

        it('should return expected result', () => {
          expect(result).toBe(expectedResult);
        });
      });
    },
  );
});
