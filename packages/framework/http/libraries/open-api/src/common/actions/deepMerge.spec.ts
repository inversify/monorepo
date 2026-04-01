import { beforeAll, describe, expect, it } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';

import { deepMerge } from './deepMerge.js';

describe(deepMerge, () => {
  describe.each<[string, () => JsonValue, () => JsonValue, () => JsonValue]>([
    [
      'array target and object source',
      (): JsonValue => [],
      (): JsonValue => ({}),
      (): JsonValue => [{}],
    ],
    [
      'non-array non-object target',
      (): JsonValue => null,
      (): JsonValue => 5,
      (): JsonValue => 5,
    ],
    [
      'empty objects',
      (): JsonValue => ({}),
      (): JsonValue => ({}),
      (): JsonValue => ({}),
    ],
    [
      'empty source object',
      (): JsonValue => ({ a: 1 }),
      (): JsonValue => ({}),
      (): JsonValue => ({ a: 1 }),
    ],
    [
      'non-empty source object',
      (): JsonValue => ({ a: 1 }),
      (): JsonValue => ({ b: 2 }),
      (): JsonValue => ({ a: 1, b: 2 }),
    ],
    [
      'target object with common property',
      (): JsonValue => ({ a: 1 }),
      (): JsonValue => ({ a: 2 }),
      (): JsonValue => ({ a: 2 }),
    ],
    [
      'array target and source',
      (): JsonValue => [1, 2],
      (): JsonValue => [3, 4],
      (): JsonValue => [1, 2, 3, 4],
    ],
  ])(
    'having two JSON objects with %s',
    (
      _: string,
      targetFixture: () => JsonValue,
      sourceFixture: () => JsonValue,
      expectedResult: () => JsonValue,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = deepMerge(targetFixture(), sourceFixture());
        });

        it('should return expected result', () => {
          expect(result).toStrictEqual(expectedResult());
        });
      });
    },
  );

  describe('with shared source references', () => {
    describe('when called, and source object is merged into two targets', () => {
      let target1: JsonValue;
      let target2: JsonValue;

      beforeAll(() => {
        const source: JsonValue = {
          list: [10, 20],
          nested: { value: 1 },
        };

        target1 = deepMerge({}, source);
        target2 = deepMerge({}, source);

        (target1 as Record<string, unknown>)['nested'] = { value: 999 };
        ((target1 as Record<string, unknown>)['list'] as number[]).push(999);
      });

      it('should not share references between targets', () => {
        expect(target2).toStrictEqual({
          list: [10, 20],
          nested: { value: 1 },
        });
      });
    });

    describe('when called, and array source is merged into two targets', () => {
      let target1: JsonValue;
      let target2: JsonValue;

      beforeAll(() => {
        const sourceArray: JsonValue[] = [{ a: 1 }, { b: 2 }];

        target1 = deepMerge([], sourceArray);
        target2 = deepMerge([], sourceArray);

        ((target1 as JsonValue[])[0] as Record<string, unknown>)['a'] = 999;
      });

      it('should not share references between targets', () => {
        expect((target2 as JsonValue[])[0]).toStrictEqual({ a: 1 });
      });
    });
  });

  describe('with prototype pollution keys', () => {
    describe('when called, and source contains __proto__', () => {
      beforeAll(() => {
        const source: JsonValue = JSON.parse(
          '{"__proto__": {"polluted": true}}',
        ) as JsonValue;

        deepMerge({}, source);
      });

      it('should not pollute Object.prototype', () => {
        expect(
          (Object.prototype as Record<string, unknown>)['polluted'],
        ).toBeUndefined();
      });
    });

    describe('when called, and source contains prototype key', () => {
      it('should not include prototype key in result', () => {
        const source: JsonValue = { prototype: { evil: true } };
        const result: JsonValue = deepMerge({}, source);

        expect(Object.prototype.hasOwnProperty.call(result, 'prototype')).toBe(
          false,
        );
      });
    });

    describe('when called, and source contains constructor key', () => {
      it('should not include constructor key in result', () => {
        const source: JsonValue = { constructor: { evil: true } };
        const result: JsonValue = deepMerge({}, source);

        expect(
          Object.prototype.hasOwnProperty.call(result, 'constructor'),
        ).toBe(false);
      });
    });
  });
});
