import { beforeAll, describe, expect, it } from 'vitest';

import { isPathParam } from './isPathParam.js';

describe(isPathParam, () => {
  describe('having a segment that is a path param', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isPathParam('{userId}');
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });

  describe('having a segment that is not a path param', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isPathParam('users');
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });

  describe('having a segment that starts with { but does not end with }', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isPathParam('{userId');
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });

  describe('having an empty segment', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isPathParam('');
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });
});
