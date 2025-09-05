import { beforeAll, describe, expect, it } from 'vitest';

import { buildNormalizedPath } from './buildNormalizedPath';

describe(buildNormalizedPath, () => {
  describe.each<[string, string]>([
    ['/', '/'],
    ['/foo', '/foo'],
    ['/foo/', '/foo'],
    ['/foo/bar', '/foo/bar'],
    ['/foo//bar', '/foo/bar'],
    ['/foo/bar/', '/foo/bar'],
  ])('having %p input', (input: string, expected: string) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildNormalizedPath(input);
      });

      it('should return the expected normalized path', () => {
        expect(result).toBe(expected);
      });
    });
  });
});
