import { beforeAll, describe, expect, it } from 'vitest';

import { routerBasename } from './routerBasename.js';

describe(routerBasename, () => {
  describe('having a Vite base with a trailing slash', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = routerBasename('/.inversify/http-insights-ui/');
      });

      it('should drop the trailing slash', () => {
        expect(result).toBe('/.inversify/http-insights-ui');
      });
    });
  });

  describe('having the root base', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = routerBasename('/');
      });

      it('should keep the root', () => {
        expect(result).toBe('/');
      });
    });
  });
});
