import { beforeAll, describe, expect, it } from 'vitest';

import { JsonValue } from '@inversifyjs/json-schema-types';

import { resolveJsonPointer } from './resolveJsonPointer';

describe(resolveJsonPointer, () => {
  describe.each<[string, JsonValue, JsonValue | undefined]>([
    [
      '',
      {
        '': 0,
        ' ': 7,
        'a/b': 1,
        'c%d': 2,
        'e^f': 3,
        foo: ['bar', 'baz'],
        'g|h': 4,
        'i\\j': 5,
        'k"l': 6,
        'm~n': 8,
      },
      {
        '': 0,
        ' ': 7,
        'a/b': 1,
        'c%d': 2,
        'e^f': 3,
        foo: ['bar', 'baz'],
        'g|h': 4,
        'i\\j': 5,
        'k"l': 6,
        'm~n': 8,
      },
    ],
    [
      '/foo',
      {
        '': 0,
        ' ': 7,
        'a/b': 1,
        'c%d': 2,
        'e^f': 3,
        foo: ['bar', 'baz'],
        'g|h': 4,
        'i\\j': 5,
        'k"l': 6,
        'm~n': 8,
      },
      ['bar', 'baz'],
    ],
    [
      '/foo/0',
      {
        '': 0,
        ' ': 7,
        'a/b': 1,
        'c%d': 2,
        'e^f': 3,
        foo: ['bar', 'baz'],
        'g|h': 4,
        'i\\j': 5,
        'k"l': 6,
        'm~n': 8,
      },
      'bar',
    ],
    [
      '/',
      {
        '': 0,
        ' ': 7,
        'a/b': 1,
        'c%d': 2,
        'e^f': 3,
        foo: ['bar', 'baz'],
        'g|h': 4,
        'i\\j': 5,
        'k"l': 6,
        'm~n': 8,
      },
      0,
    ],
    [
      '/a~1b',
      {
        '': 0,
        ' ': 7,
        'a/b': 1,
        'c%d': 2,
        'e^f': 3,
        foo: ['bar', 'baz'],
        'g|h': 4,
        'i\\j': 5,
        'k"l': 6,
        'm~n': 8,
      },
      1,
    ],
    [
      '/c%d',
      {
        '': 0,
        ' ': 7,
        'a/b': 1,
        'c%d': 2,
        'e^f': 3,
        foo: ['bar', 'baz'],
        'g|h': 4,
        'i\\j': 5,
        'k"l': 6,
        'm~n': 8,
      },
      2,
    ],
    [
      '/e^f',
      {
        '': 0,
        ' ': 7,
        'a/b': 1,
        'c%d': 2,
        'e^f': 3,
        foo: ['bar', 'baz'],
        'g|h': 4,
        'i\\j': 5,
        'k"l': 6,
        'm~n': 8,
      },
      3,
    ],
    [
      '/g|h',
      {
        '': 0,
        ' ': 7,
        'a/b': 1,
        'c%d': 2,
        'e^f': 3,
        foo: ['bar', 'baz'],
        'g|h': 4,
        'i\\j': 5,
        'k"l': 6,
        'm~n': 8,
      },
      4,
    ],
    [
      '/i\\j',
      {
        '': 0,
        ' ': 7,
        'a/b': 1,
        'c%d': 2,
        'e^f': 3,
        foo: ['bar', 'baz'],
        'g|h': 4,
        'i\\j': 5,
        'k"l': 6,
        'm~n': 8,
      },
      5,
    ],
    [
      '/k"l',
      {
        '': 0,
        ' ': 7,
        'a/b': 1,
        'c%d': 2,
        'e^f': 3,
        foo: ['bar', 'baz'],
        'g|h': 4,
        'i\\j': 5,
        'k"l': 6,
        'm~n': 8,
      },
      6,
    ],
    [
      '/ ',
      {
        '': 0,
        ' ': 7,
        'a/b': 1,
        'c%d': 2,
        'e^f': 3,
        foo: ['bar', 'baz'],
        'g|h': 4,
        'i\\j': 5,
        'k"l': 6,
        'm~n': 8,
      },
      7,
    ],
    [
      '/m~0n',
      {
        '': 0,
        ' ': 7,
        'a/b': 1,
        'c%d': 2,
        'e^f': 3,
        foo: ['bar', 'baz'],
        'g|h': 4,
        'i\\j': 5,
        'k"l': 6,
        'm~n': 8,
      },
      8,
    ],
  ])(
    'having a "%s" pointer',
    (
      pointer: string,
      json: JsonValue,
      expectedResult: JsonValue | undefined,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = resolveJsonPointer(json, pointer);
        });

        it('should return the expected result', () => {
          expect(result).toStrictEqual(expectedResult);
        });
      });
    },
  );
});
