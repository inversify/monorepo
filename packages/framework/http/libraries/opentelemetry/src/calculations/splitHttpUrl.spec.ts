import { describe, expect, it } from 'vitest';

import { splitHttpUrl } from './splitHttpUrl.js';

describe(splitHttpUrl, () => {
  describe('having a url with a query', () => {
    describe('when called', () => {
      it('should return the path and the query', () => {
        expect(splitHttpUrl('/items?q=hero')).toStrictEqual({
          path: '/items',
          query: 'q=hero',
        });
      });
    });
  });

  describe('having a url without a query', () => {
    describe('when called', () => {
      it('should return the path', () => {
        expect(splitHttpUrl('/items')).toStrictEqual({
          path: '/items',
          query: undefined,
        });
      });
    });
  });
});
