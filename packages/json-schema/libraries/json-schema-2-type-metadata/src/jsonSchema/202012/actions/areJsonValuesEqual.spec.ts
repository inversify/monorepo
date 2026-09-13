import { describe, expect, it } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';

import { areJsonValuesEqual } from './areJsonValuesEqual.js';

describe(areJsonValuesEqual, () => {
  describe.each<[string, JsonValue, JsonValue, boolean]>([
    ['equal strings', 'foo', 'foo', true],
    ['different strings', 'foo', 'bar', false],
    ['equal numbers', 1, 1, true],
    ['different numbers', 1, 1.5, false],
    ['equal booleans', true, true, true],
    ['null and null', null, null, true],
    ['null and object', null, {}, false],
    ['empty objects', {}, {}, true],
    ['objects with the same properties', { foo: 'bar' }, { foo: 'bar' }, true],
    [
      'objects with nested arrays',
      { items: [1, { name: 'x' }] },
      { items: [1, { name: 'x' }] },
      true,
    ],
    [
      'objects with different nested values',
      { items: [1, { name: 'x' }] },
      { items: [1, { name: 'y' }] },
      false,
    ],
    [
      'objects with a missing property',
      { extra: 1, foo: 'bar' },
      { foo: 'bar' },
      false,
    ],
    ['an object and an array', { 0: 1 }, [1], false],
    ['equal arrays', [1, 'a', { foo: true }], [1, 'a', { foo: true }], true],
    ['arrays of different length', [1, 2], [1, 2, 3], false],
  ])(
    'having %s',
    (
      _: string,
      leftJsonValueFixture: JsonValue,
      rightJsonValueFixture: JsonValue,
      expected: boolean,
    ) => {
      describe('when called', () => {
        it('should return the expected equality', () => {
          expect(
            areJsonValuesEqual(leftJsonValueFixture, rightJsonValueFixture),
          ).toBe(expected);
        });
      });
    },
  );
});
