import { beforeAll, describe, expect, it } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';

import { deepMerge } from './deepMerge.js';

describe.each<[string, JsonValue, JsonValue, JsonValue]>([
  ['array target', [], {}, [{}]],
  ['non-array non-object target', null, 5, 5],
  ['empty objects', {}, {}, {}],
  ['empty source object', { a: 1 }, {}, { a: 1 }],
  ['non-empty source object', { a: 1 }, { b: 2 }, { a: 1, b: 2 }],
  ['target object with common property', { a: 1 }, { a: 2 }, { a: 2 }],
  ['array target and source', [1, 2], [3, 4], [1, 2, 3, 4]],
])(
  'having two JSON objects with %s',
  (
    _: string,
    targetFixture: JsonValue,
    sourceFixture: JsonValue,
    expectedResult: JsonValue,
  ) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = deepMerge(targetFixture, sourceFixture);
      });

      it('should return expected result', () => {
        expect(result).toStrictEqual(expectedResult);
      });
    });
  },
);
