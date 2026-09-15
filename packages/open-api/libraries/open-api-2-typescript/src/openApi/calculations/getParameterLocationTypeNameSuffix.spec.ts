import { beforeAll, describe, expect, it } from 'vitest';

import { getParameterLocationTypeNameSuffix } from './getParameterLocationTypeNameSuffix.js';

describe(getParameterLocationTypeNameSuffix, () => {
  describe.each<[string, string, string]>([
    ['a cookie location', 'cookie', 'Cookies'],
    ['a header location', 'header', 'Headers'],
    ['a path location', 'path', 'PathParams'],
    ['a query location', 'query', 'Query'],
    ['a querystring location', 'querystring', 'Querystring'],
  ])('having %s', (_: string, locationFixture: string, expected: string) => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getParameterLocationTypeNameSuffix(locationFixture);
      });

      it('should return the expected suffix', () => {
        expect(result).toBe(expected);
      });
    });
  });

  describe('having an unknown location', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getParameterLocationTypeNameSuffix('body');
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
