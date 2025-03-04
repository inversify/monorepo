import { beforeAll, describe, expect, it } from 'vitest';

import { chain } from './chain';

describe(chain.name, () => {
  describe('when called', () => {
    let firstIterableFixture: Iterable<unknown>;
    let secondIterableFixture: Iterable<unknown>;

    let result: unknown;

    beforeAll(() => {
      firstIterableFixture = [1];
      secondIterableFixture = [2];

      result = chain(firstIterableFixture, secondIterableFixture);
    });

    it('should return a chained iterable', () => {
      expect([...(result as Iterable<unknown>)]).toStrictEqual([
        ...firstIterableFixture,
        ...secondIterableFixture,
      ]);
    });
  });
});
