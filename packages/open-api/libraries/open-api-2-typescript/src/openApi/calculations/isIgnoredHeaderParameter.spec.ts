import { beforeAll, describe, expect, it } from 'vitest';

import { isIgnoredHeaderParameter } from './isIgnoredHeaderParameter.js';

describe(isIgnoredHeaderParameter, () => {
  describe.each<[string, string, string, boolean]>([
    ['a header named Accept', 'header', 'Accept', true],
    ['a header named Content-Type', 'header', 'Content-Type', true],
    ['a header named Authorization', 'header', 'Authorization', true],
    ['a header named accept', 'header', 'accept', true],
    ['a header named AUTHORIZATION', 'header', 'AUTHORIZATION', true],
    ['a header named content-type', 'header', 'content-type', true],
    ['a header named X-Request-Id', 'header', 'X-Request-Id', false],
    ['a query named Authorization', 'query', 'Authorization', false],
    ['a cookie named Authorization', 'cookie', 'Authorization', false],
  ])(
    'having %s',
    (
      _: string,
      locationFixture: string,
      nameFixture: string,
      expected: boolean,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = isIgnoredHeaderParameter(locationFixture, nameFixture);
        });

        it('should return the expected boolean', () => {
          expect(result).toBe(expected);
        });
      });
    },
  );
});
