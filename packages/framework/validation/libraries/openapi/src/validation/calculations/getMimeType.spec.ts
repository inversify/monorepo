import { beforeAll, describe, expect, it } from 'vitest';

import { getMimeType } from './getMimeType.js';

describe(getMimeType, () => {
  describe.each<[string, string, string]>([
    [
      'content type with no parameters and no spaces',
      'application/json',
      'application/json',
    ],
    [
      'content type with no parameters and spaces',
      ' application/json ',
      'application/json',
    ],
    [
      'content type with parameters',
      'application/json; charset=utf-8',
      'application/json',
    ],
    [
      'content type with parameters and spaces',
      ' application/json ; charset=utf-8 ',
      'application/json',
    ],
  ])('having %s', (_: string, url: string, expected: string) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getMimeType(url);
      });

      it(`should return expected result`, () => {
        expect(result).toBe(expected);
      });
    });
  });
});
