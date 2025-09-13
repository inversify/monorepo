import { beforeAll, describe, expect, it } from 'vitest';

import { escapeJsonPointerFragments } from './escapeJsonPointerFragments';

describe(escapeJsonPointerFragments, () => {
  describe.each<[string[], string]>([
    [[], ''],
    [[''], ''],
    [['foo'], 'foo'],
    [['foo', 'bar'], 'foo/bar'],
    [['foo', 'bar', 'baz'], 'foo/bar/baz'],
    [['a/b'], 'a~1b'],
    [['m~n'], 'm~0n'],
    [['a/b', 'c~d'], 'a~1b/c~0d'],
    [['~'], '~0'],
    [['/'], '~1'],
    [['~/'], '~0~1'],
    [['~/', 'a/b'], '~0~1/a~1b'],
    [['~0'], '~00'],
    [['~1'], '~01'],
    [['~0~1'], '~00~01'],
    [['path~with/both'], 'path~0with~1both'],
    [['', 'empty', ''], '/empty/'],
    [[' '], ' '],
    [['special', 'chars%', 'test^'], 'special/chars%/test^'],
    [['backslash\\test'], 'backslash\\test'],
    [['quote"test'], 'quote"test'],
    [['pipe|test'], 'pipe|test'],
  ])('having fragments %j', (fragments: string[], expectedResult: string) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = escapeJsonPointerFragments(...fragments);
      });

      it('should return the expected result', () => {
        expect(result).toBe(expectedResult);
      });
    });
  });
});
