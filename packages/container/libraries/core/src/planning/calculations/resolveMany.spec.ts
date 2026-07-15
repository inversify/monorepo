import { beforeAll, describe, expect, it } from 'vitest';

import { resolveMany } from './resolveMany.js';

describe(resolveMany, () => {
  describe('having five values', () => {
    describe('when called, and all values are sync', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveMany(
          1,
          2,
          3,
          4,
          5,
          (
            value1: number,
            value2: number,
            value3: number,
            value4: number,
            value5: number,
          ) => [value1, value2, value3, value4, value5],
        );
      });

      it('should build with the resolved values', () => {
        expect(result).toStrictEqual([1, 2, 3, 4, 5]);
      });
    });

    describe('when called, and some values are promises', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveMany(
          1,
          Promise.resolve(2),
          3,
          Promise.resolve(4),
          5,
          (
            value1: number,
            value2: number,
            value3: number,
            value4: number,
            value5: number,
          ) => [value1, value2, value3, value4, value5],
        );
      });

      it('should build with the resolved values', () => {
        expect(result).toStrictEqual(Promise.resolve([1, 2, 3, 4, 5]));
      });
    });

    describe('when called, and all values are promises', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveMany(
          Promise.resolve(1),
          Promise.resolve(2),
          Promise.resolve(3),
          Promise.resolve(4),
          Promise.resolve(5),
          (
            value1: number,
            value2: number,
            value3: number,
            value4: number,
            value5: number,
          ) => [value1, value2, value3, value4, value5],
        );
      });

      it('should build with the resolved values', () => {
        expect(result).toStrictEqual(Promise.resolve([1, 2, 3, 4, 5]));
      });
    });
  });
});
