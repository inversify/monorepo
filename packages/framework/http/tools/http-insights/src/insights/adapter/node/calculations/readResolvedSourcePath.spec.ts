import { beforeAll, describe, expect, it } from 'vitest';

import { pathToFileURL } from 'node:url';

import { readResolvedSourcePath } from './readResolvedSourcePath.js';

describe(readResolvedSourcePath, () => {
  describe('having a relative source', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = readResolvedSourcePath('../src/handler.ts', null, '/app/dist');
      });

      it('should resolve the source against the map directory', () => {
        expect(result).toBe('/app/src/handler.ts');
      });
    });
  });

  describe('having a relative source root', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = readResolvedSourcePath('handler.ts', '../src', '/app/dist');
      });

      it('should resolve the root and then the source', () => {
        expect(result).toBe('/app/src/handler.ts');
      });
    });
  });

  describe('having an absolute source', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = readResolvedSourcePath(
          '/src/handler.ts',
          '../other',
          '/app/dist',
        );
      });

      it('should keep the absolute source', () => {
        expect(result).toBe('/src/handler.ts');
      });
    });
  });

  describe('having a file url', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = readResolvedSourcePath(
          pathToFileURL('/src/handler.ts').href,
          null,
          '/app/dist',
        );
      });

      it('should return the file path', () => {
        expect(result).toBe('/src/handler.ts');
      });
    });
  });

  describe('having an https source', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = readResolvedSourcePath(
          'handler.ts',
          'https://example.com/src',
          '/app/dist',
        );
      });

      it('should join the source onto that url', () => {
        expect(result).toBe('https://example.com/src/handler.ts');
      });
    });
  });
});
