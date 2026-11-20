import { beforeAll, describe, expect, it } from 'vitest';

import { omitUndefined } from './omitUndefined.js';

describe(omitUndefined, () => {
  describe('having a record with undefined values', () => {
    let recordFixture: { a: number; b: string | undefined; c: null };

    beforeAll(() => {
      recordFixture = { a: 1, b: undefined, c: null };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = omitUndefined(recordFixture);
      });

      it('should return the record without undefined values', () => {
        expect(result).toStrictEqual({ a: 1, c: null });
      });
    });
  });
});
