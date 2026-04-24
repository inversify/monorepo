import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./inferSchemaTypeOrPrimitivaSchemaTypeOrThrow.js'));

import { type OpenApiResolver } from '../services/OpenApiResolver.js';
import { buildQueryParse, buildQueryParseFromType } from './buildQueryParse.js';
import { inferSchemaTypeOrPrimitivaSchemaTypeOrThrow } from './inferSchemaTypeOrPrimitivaSchemaTypeOrThrow.js';

describe(buildQueryParseFromType, () => {
  afterAll(() => {
    vitest.restoreAllMocks();
  });

  describe('having isNullable false and type "boolean"', () => {
    describe('when called with a string "true"', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildQueryParseFromType(false, 'boolean')('true');
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });

    describe('when called with a string "false"', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildQueryParseFromType(false, 'boolean')('false');
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });

    describe('when called with a non-string value', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildQueryParseFromType(false, 'boolean')(42);
      });

      it('should return the value unchanged', () => {
        expect(result).toBe(42);
      });
    });
  });

  describe('having isNullable true and type "boolean"', () => {
    describe('when called with a string "true"', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildQueryParseFromType(true, 'boolean')('true');
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });

    describe('when called with a non-string value', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildQueryParseFromType(true, 'boolean')(['true']);
      });

      it('should return the value unchanged', () => {
        expect(result).toStrictEqual(['true']);
      });
    });
  });

  describe('having isNullable false and type "number"', () => {
    describe('when called with a numeric string', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildQueryParseFromType(false, 'number')('3.14');
      });

      it('should return the parsed number', () => {
        expect(result).toBe(3.14);
      });
    });

    describe('when called with a non-numeric string', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildQueryParseFromType(false, 'number')('not-a-number');
      });

      it('should return the string unchanged', () => {
        expect(result).toBe('not-a-number');
      });
    });

    describe('when called with a non-string value', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildQueryParseFromType(false, 'number')([10, 20]);
      });

      it('should return the value unchanged', () => {
        expect(result).toStrictEqual([10, 20]);
      });
    });
  });

  describe('having isNullable false and type "integer"', () => {
    describe('when called with a numeric string', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildQueryParseFromType(false, 'integer')('42');
      });

      it('should return the parsed number', () => {
        expect(result).toBe(42);
      });
    });
  });

  describe('having isNullable true and type "number"', () => {
    describe('when called with a numeric string', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildQueryParseFromType(true, 'number')('5');
      });

      it('should return the parsed number', () => {
        expect(result).toBe(5);
      });
    });
  });

  describe('having type "null"', () => {
    describe('when called with an empty string', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildQueryParseFromType(false, 'null')('');
      });

      it('should return null', () => {
        expect(result).toBeNull();
      });
    });

    describe('when called with undefined', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildQueryParseFromType(false, 'null')(undefined);
      });

      it('should return null', () => {
        expect(result).toBeNull();
      });
    });

    describe('when called with a non-string value', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildQueryParseFromType(false, 'null')({ foo: 'bar' });
      });

      it('should return the value unchanged', () => {
        expect(result).toStrictEqual({ foo: 'bar' });
      });
    });
  });

  describe('having type "string" (default)', () => {
    describe('when called with any value', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildQueryParseFromType(false, 'string')('hello');
      });

      it('should return the value unchanged', () => {
        expect(result).toBe('hello');
      });
    });

    describe('when called with a non-string value', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildQueryParseFromType(false, 'string')(['a', 'b']);
      });

      it('should return the value unchanged', () => {
        expect(result).toStrictEqual(['a', 'b']);
      });
    });
  });
});

describe(buildQueryParse, () => {
  let openApiResolverFixture: OpenApiResolver;

  beforeAll(() => {
    openApiResolverFixture = {
      deepResolveReference: vitest.fn(),
      resolveReference: vitest.fn(),
    };
  });

  afterAll(() => {
    vitest.restoreAllMocks();
  });

  describe('when called with a string schema', () => {
    let result: unknown;

    beforeAll(() => {
      vitest
        .mocked(inferSchemaTypeOrPrimitivaSchemaTypeOrThrow)
        .mockReturnValueOnce({ isNullable: false, type: 'string' });

      result = buildQueryParse(
        openApiResolverFixture,
        { type: 'string' },
        '#/test/schema',
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call inferSchemaTypeOrPrimitivaSchemaTypeOrThrow', () => {
      expect(
        inferSchemaTypeOrPrimitivaSchemaTypeOrThrow,
      ).toHaveBeenCalledExactlyOnceWith(
        openApiResolverFixture,
        { type: 'string' },
        '#/test/schema',
      );
    });

    it('should return a function', () => {
      expect(result).toBeTypeOf('function');
    });

    it('should return a parse function that passes the value through', () => {
      const parseFn: (value: unknown) => unknown = result as (
        value: unknown,
      ) => unknown;

      expect(parseFn('hello')).toBe('hello');
    });
  });

  describe('when called with a nullable integer schema', () => {
    let result: unknown;

    beforeAll(() => {
      vitest
        .mocked(inferSchemaTypeOrPrimitivaSchemaTypeOrThrow)
        .mockReturnValueOnce({ isNullable: true, type: 'integer' });

      result = buildQueryParse(
        openApiResolverFixture,
        { type: ['integer', 'null'] },
        '#/test/schema',
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should return a parse function that coerces numeric strings', () => {
      const parseFn: (value: unknown) => unknown = result as (
        value: unknown,
      ) => unknown;

      expect(parseFn('10')).toBe(10);
    });
  });
});
