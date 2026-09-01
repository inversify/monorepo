import { beforeAll, describe, expect, it } from 'vitest';

import {
  isTypeScriptIdentifierSyntax,
  toTypeScriptIdentifier,
} from './toTypeScriptIdentifier.js';

describe(isTypeScriptIdentifierSyntax, () => {
  describe.each<[string, string, boolean]>([
    ['an empty string', '', false],
    ['an identifier', 'Foo', true],
    ['an identifier with a leading dollar sign', '$foo', true],
    ['an identifier with a leading underscore', '_foo', true],
    ['a reserved word', 'string', true],
    ['a string with a hyphen', 'foo-bar', false],
    ['a string with a leading digit', '2Foo', false],
    ['a string with a space', 'My Type', false],
  ])('having %s', (_: string, valueFixture: string, expected: boolean) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isTypeScriptIdentifierSyntax(valueFixture);
      });

      it('should return the expected boolean', () => {
        expect(result).toBe(expected);
      });
    });
  });
});

describe(toTypeScriptIdentifier, () => {
  describe.each<[string, string, string]>([
    ['an identifier', 'Foo', 'Foo'],
    ['an identifier with a leading dollar sign', '$foo', '$foo'],
    ['an empty string', '', '_'],
    ['a string with a space', 'My Type', 'My_Type'],
    ['a string with a hyphen', 'foo-bar', 'foo_bar'],
    ['a string with only symbols', '!!!', '___'],
    ['a string with a leading digit', '2Foo', '_2Foo'],
    ['a reserved word', 'string', '_string'],
    ['a reserved word after sanitizing', 'class', '_class'],
  ])('having %s', (_: string, valueFixture: string, expected: string) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = toTypeScriptIdentifier(valueFixture);
      });

      it('should return the expected identifier', () => {
        expect(result).toBe(expected);
      });
    });
  });
});
