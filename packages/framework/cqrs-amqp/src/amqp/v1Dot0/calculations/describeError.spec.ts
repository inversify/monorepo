import { beforeAll, describe, expect, it } from 'vitest';

import { describeError } from './describeError.js';

describe(describeError, () => {
  describe.each<[string, unknown, string]>([
    [
      'an Error',
      new Error('Inventory is unavailable'),
      'Inventory is unavailable',
    ],
    ['a string', 'Inventory is unavailable', 'Inventory is unavailable'],
    ['a number', 3, '3'],
    ['a boolean', false, 'false'],
    ['a bigint', 3n, '3'],
    ['a symbol', Symbol('failure'), 'Symbol(failure)'],
    ['undefined', undefined, 'undefined'],
    ['null', null, 'null'],
    ['a plain object', { code: 'E_FAIL' }, '{"code":"E_FAIL"}'],
  ])(
    'having %s',
    (_: string, errorFixture: unknown, expectedResult: string) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = describeError(errorFixture);
        });

        it('should return a description', () => {
          expect(result).toBe(expectedResult);
        });
      });
    },
  );

  describe('having a function', () => {
    let errorFixture: () => void;

    beforeAll(() => {
      errorFixture = (): void => {};
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = describeError(errorFixture);
      });

      it('should return the function source', () => {
        expect(result).toBe(errorFixture.toString());
      });
    });
  });

  describe('having an object that cannot be serialized', () => {
    let errorFixture: Record<string, unknown>;

    beforeAll(() => {
      errorFixture = {};
      errorFixture['self'] = errorFixture;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = describeError(errorFixture);
      });

      it('should return the object tag', () => {
        expect(result).toBe('[object Object]');
      });
    });
  });

  describe('having an Error whose message throws', () => {
    let errorFixture: Error;

    beforeAll(() => {
      errorFixture = new Error('Inventory is unavailable');

      Object.defineProperty(errorFixture, 'message', {
        get: (): string => {
          throw new Error('message failed');
        },
      });
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = describeError(errorFixture);
      });

      it('should return a fallback description', () => {
        expect(result).toBe('[unrepresentable error]');
      });
    });
  });
});
