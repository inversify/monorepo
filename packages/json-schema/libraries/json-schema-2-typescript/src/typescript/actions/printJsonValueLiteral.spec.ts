import { beforeAll, describe, expect, it } from 'vitest';

import { type JsonValue } from '@inversifyjs/json-schema-types';

import {
  printJsonValueLiteral,
  printPropertyKey,
} from './printJsonValueLiteral.js';

describe(printJsonValueLiteral, () => {
  describe.each<[string, JsonValue, string]>([
    ['null', null, 'null'],
    ['true', true, 'true'],
    ['false', false, 'false'],
    ['an integer', 1, '1'],
    ['a float', 1.5, '1.5'],
    ['a negative number', -2, '-2'],
    ['a string', 'foo', '"foo"'],
    ['a string with quotes', 'foo"bar', '"foo\\"bar"'],
    ['an empty array', [], '[]'],
    ['an array of mixed values', [1, 'a', null], '[1, "a", null]'],
    ['an empty object', {}, '{}'],
    ['an object with an identifier key', { foo: 'bar' }, '{ foo: "bar" }'],
    ['an object with a quoted key', { 'foo-bar': true }, '{ "foo-bar": true }'],
    [
      'a nested object and array',
      { a: [1, { b: false }] },
      '{ a: [1, { b: false }] }',
    ],
  ])('having %s', (_: string, valueFixture: JsonValue, expected: string) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = printJsonValueLiteral(valueFixture);
      });

      it('should return the expected TypeScript literal', () => {
        expect(result).toBe(expected);
      });
    });
  });
});

describe(printPropertyKey, () => {
  describe.each<[string, string, string]>([
    ['an identifier', 'foo', 'foo'],
    ['a reserved word', 'class', 'class'],
    ['a hyphenated key', 'foo-bar', '"foo-bar"'],
    ['an empty string', '', '""'],
    ['a key with a space', 'foo bar', '"foo bar"'],
  ])('having %s', (_: string, propertyFixture: string, expected: string) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = printPropertyKey(propertyFixture);
      });

      it('should return the expected property key', () => {
        expect(result).toBe(expected);
      });
    });
  });
});
