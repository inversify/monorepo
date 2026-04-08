import { beforeAll, describe, expect, it } from 'vitest';

import { getPath } from './getPath.js';

describe(getPath, () => {
  describe.each<[string, string, string]>([
    ['url with no query', '/users', '/users'],
    ['url with query', '/users?name=John', '/users'],
  ])('having %s', (_: string, url: string, expected: string) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getPath(url);
      });

      it(`should return expected result`, () => {
        expect(result).toBe(expected);
      });
    });
  });
});
