import { beforeAll, describe, expect, it } from 'vitest';

import { isLocalFilePath } from './isLocalFilePath.js';

describe(isLocalFilePath, () => {
  describe('having an absolute path', () => {
    describe('when called', () => {
      let result: boolean;

      beforeAll(() => {
        result = isLocalFilePath('/app/src/handler.ts');
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });

  describe('having a url', () => {
    describe('when called', () => {
      let result: boolean;

      beforeAll(() => {
        result = isLocalFilePath('https://example.com/handler.ts');
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });
});
