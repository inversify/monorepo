import { beforeAll, describe, expect, it } from 'vitest';

import { type Left, type Right } from '@inversifyjs/common';

import { cloneBindingCache } from './cloneBindingCache.js';

describe(cloneBindingCache, () => {
  describe('having a left cache', () => {
    let cacheFixture: Left<undefined>;

    beforeAll(() => {
      cacheFixture = {
        isRight: false,
        value: undefined,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = cloneBindingCache(cacheFixture);
      });

      it('should return the same cache', () => {
        expect(result).toBe(cacheFixture);
      });
    });
  });

  describe('having a right cache', () => {
    let cacheFixture: Right<unknown>;

    beforeAll(() => {
      cacheFixture = {
        isRight: true,
        value: Symbol(),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = cloneBindingCache(cacheFixture);
      });

      it('should return a cloned cache', () => {
        const expectedCache: Right<unknown> = {
          isRight: true,
          value: cacheFixture.value,
        };

        expect(result).toStrictEqual(expectedCache);
      });
    });
  });
});
