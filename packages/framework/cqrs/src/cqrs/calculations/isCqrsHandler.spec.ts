import { beforeAll, describe, expect, it } from 'vitest';

import { isCqrsHandler } from './isCqrsHandler.js';

describe(isCqrsHandler, () => {
  describe('when called', () => {
    describe('having an object with a handle method', () => {
      let result: boolean;

      beforeAll(() => {
        result = isCqrsHandler({
          handle: (): undefined => undefined,
        });
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });

    describe('having an object without a handle method', () => {
      let result: boolean;

      beforeAll(() => {
        result = isCqrsHandler({});
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });
});
