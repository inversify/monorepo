import { beforeAll, describe, expect, it } from 'vitest';

import { readUrlScheme } from './readUrlScheme.js';

describe(readUrlScheme, () => {
  describe('having an https url', () => {
    describe('when called', () => {
      let result: string | null;

      beforeAll(() => {
        result = readUrlScheme('https://example.com/handler.ts');
      });

      it('should return the scheme', () => {
        expect(result).toBe('https');
      });
    });
  });

  describe('having a file path', () => {
    describe('when called', () => {
      let result: string | null;

      beforeAll(() => {
        result = readUrlScheme('/app/src/handler.ts');
      });

      it('should return null', () => {
        expect(result).toBeNull();
      });
    });
  });

  describe('having a drive letter', () => {
    describe('when called', () => {
      let result: string | null;

      beforeAll(() => {
        result = readUrlScheme('C:/app/src/handler.ts');
      });

      it('should return null', () => {
        expect(result).toBeNull();
      });
    });
  });
});
