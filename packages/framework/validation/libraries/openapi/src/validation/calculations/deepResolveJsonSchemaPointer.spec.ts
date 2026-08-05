import { beforeAll, describe, expect, it, type Mock, vitest } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';

import { deepResolveJsonSchemaPointer } from './deepResolveJsonSchemaPointer.js';

const RFC6901_DOCUMENT: JsonValue = {
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
};

describe(deepResolveJsonSchemaPointer, () => {
  describe.each<
    [
      string,
      Mock<(uri: string) => JsonValue | undefined>,
      JsonValue,
      JsonValue | undefined,
    ]
  >([
    ['', vitest.fn(), RFC6901_DOCUMENT, RFC6901_DOCUMENT],
    ['/foo', vitest.fn(), RFC6901_DOCUMENT, ['bar', 'baz']],
    ['/foo/0', vitest.fn(), RFC6901_DOCUMENT, 'bar'],
    ['/', vitest.fn(), RFC6901_DOCUMENT, 0],
    ['/a~1b', vitest.fn(), RFC6901_DOCUMENT, 1],
    ['/c%d', vitest.fn(), RFC6901_DOCUMENT, 2],
    ['/e^f', vitest.fn(), RFC6901_DOCUMENT, 3],
    ['/g|h', vitest.fn(), RFC6901_DOCUMENT, 4],
    ['/i\\j', vitest.fn(), RFC6901_DOCUMENT, 5],
    ['/k"l', vitest.fn(), RFC6901_DOCUMENT, 6],
    ['/ ', vitest.fn(), RFC6901_DOCUMENT, 7],
    ['/m~0n', vitest.fn(), RFC6901_DOCUMENT, 8],
    [
      '/foo/bar',
      vitest.fn(),
      {
        foo: 'bar',
      },
      undefined,
    ],
    [
      '/foo/bar',
      vitest.fn(),
      {
        foo: ['bar', 'baz'],
      },
      undefined,
    ],
    [
      '/ref',
      vitest.fn().mockReturnValueOnce({
        type: 'string',
      }),
      {
        $id: 'http://example.com/schemas/main',
        ref: {
          $ref: 'http://example.com/schemas/other',
        },
      },
      {
        type: 'string',
      },
    ],
    [
      '/ref',
      vitest.fn().mockReturnValueOnce(undefined),
      {
        $id: 'http://example.com/schemas/main',
        ref: {
          $ref: 'http://example.com/schemas/other',
        },
      },
      undefined,
    ],
    [
      '/ref',
      vitest.fn().mockReturnValueOnce(undefined),
      {
        $id: 'http://example.com/schemas/main',
        ref: {
          $ref: 'http://example.com/schemas/other#anchor',
        },
      },
      undefined,
    ],
    [
      '/ref',
      vitest.fn().mockReturnValueOnce(undefined).mockReturnValueOnce(undefined),
      {
        $id: 'http://example.com/schemas/main',
        ref: {
          $ref: 'http://example.com/schemas/other#/definitions/foo',
        },
      },
      undefined,
    ],
    [
      '/ref',
      vitest
        .fn()
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce({
          definitions: {
            foo: {
              type: 'string',
            },
          },
        }),
      {
        $id: 'http://example.com/schemas/main',
        ref: {
          $ref: 'http://example.com/schemas/other#/definitions/foo',
        },
      },
      {
        type: 'string',
      },
    ],
    [
      '/nested/ref',
      vitest.fn().mockReturnValueOnce({
        type: 'boolean',
      }),
      {
        $id: 'http://example.com/schemas/main',
        nested: {
          $id: 'nested',
          ref: {
            $ref: 'other',
          },
        },
      },
      {
        type: 'boolean',
      },
    ],
    [
      '',
      vitest.fn().mockReturnValueOnce({
        type: 'number',
      }),
      {
        $id: 'http://example.com/schemas/main',
        $ref: 'other',
      },
      {
        type: 'number',
      },
    ],
    [
      '/nested/foo',
      vitest.fn(),
      {
        nested: {
          $id: 'nested',
          foo: {
            type: 'string',
          },
        },
      },
      {
        type: 'string',
      },
    ],
    [
      '/ref',
      vitest.fn(),
      {
        ref: {
          $ref: 'other',
        },
      },
      undefined,
    ],
  ])(
    'having a "%s" pointer',
    (
      pointer: string,
      resolveUriSchema: Mock<(uri: string) => JsonValue | undefined>,
      json: JsonValue,
      expectedResult: JsonValue | undefined,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = deepResolveJsonSchemaPointer(resolveUriSchema)(
            json,
            pointer,
          );
        });

        it('should return the expected result', () => {
          expect(result).toStrictEqual(expectedResult);
        });
      });
    },
  );

  describe('having an invalid JSON pointer', () => {
    let resolveUriSchemaMock: Mock<(uri: string) => JsonValue | undefined>;
    let pointerFixture: string;
    let jsonFixture: JsonValue;

    beforeAll(() => {
      resolveUriSchemaMock = vitest.fn();
      pointerFixture = 'foo';
      jsonFixture = {
        foo: 'bar',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          deepResolveJsonSchemaPointer(resolveUriSchemaMock)(
            jsonFixture,
            pointerFixture,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an Error', () => {
        expect(result).toBeInstanceOf(Error);
        expect((result as Error).message).toBe(
          `Invalid JSON pointer "${pointerFixture}"`,
        );
      });
    });
  });
});
