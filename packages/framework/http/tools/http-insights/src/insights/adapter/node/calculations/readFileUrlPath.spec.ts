import { beforeAll, describe, expect, it } from 'vitest';

import { pathToFileURL } from 'node:url';

import { readFileUrlPath } from './readFileUrlPath.js';

describe(readFileUrlPath, () => {
  describe('having a file url', () => {
    describe('when called', () => {
      let result: string | null;

      beforeAll(() => {
        result = readFileUrlPath(pathToFileURL('/app/src/handler.ts').href);
      });

      it('should return the file path', () => {
        expect(result).toBe('/app/src/handler.ts');
      });
    });
  });

  describe('having a file url with a host', () => {
    describe('when called', () => {
      let result: string | null;

      beforeAll(() => {
        result = readFileUrlPath('file://hostname/handler.ts');
      });

      it('should return null', () => {
        expect(result).toBeNull();
      });
    });
  });
});
