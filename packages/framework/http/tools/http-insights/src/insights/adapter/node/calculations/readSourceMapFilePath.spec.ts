import { beforeAll, describe, expect, it } from 'vitest';

import { pathToFileURL } from 'node:url';

import { readSourceMapFilePath } from './readSourceMapFilePath.js';

describe(readSourceMapFilePath, () => {
  describe('having a relative url', () => {
    describe('when called', () => {
      let result: string | null;

      beforeAll(() => {
        result = readSourceMapFilePath('/app/dist/bundle.js', 'bundle.js.map');
      });

      it('should resolve the url against the generated file', () => {
        expect(result).toBe('/app/dist/bundle.js.map');
      });
    });
  });

  describe('having an absolute path', () => {
    describe('when called', () => {
      let result: string | null;

      beforeAll(() => {
        result = readSourceMapFilePath(
          '/app/dist/bundle.js',
          '/maps/bundle.js.map',
        );
      });

      it('should return that path', () => {
        expect(result).toBe('/maps/bundle.js.map');
      });
    });
  });

  describe('having a file url', () => {
    describe('when called', () => {
      let result: string | null;

      beforeAll(() => {
        result = readSourceMapFilePath(
          '/app/dist/bundle.js',
          pathToFileURL('/maps/bundle.js.map').href,
        );
      });

      it('should return the file path', () => {
        expect(result).toBe('/maps/bundle.js.map');
      });
    });
  });

  describe('having an https url', () => {
    describe('when called', () => {
      let result: string | null;

      beforeAll(() => {
        result = readSourceMapFilePath(
          '/app/dist/bundle.js',
          'https://example.com/bundle.js.map',
        );
      });

      it('should return null', () => {
        expect(result).toBeNull();
      });
    });
  });
});
