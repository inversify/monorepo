import { beforeAll, describe, expect, it } from 'vitest';

import { buildCallSearch } from './buildCallSearch.js';

describe(buildCallSearch, () => {
  describe('having the timeline and no stage', () => {
    describe('when called', () => {
      let result: URLSearchParams;

      beforeAll(() => {
        result = buildCallSearch('timeline', null);
      });

      it('should leave the search empty', () => {
        expect(result.toString()).toBe('');
      });
    });
  });

  describe('having a guard stage', () => {
    describe('when called', () => {
      let result: URLSearchParams;

      beforeAll(() => {
        result = buildCallSearch('guards', 'guard-guard-1');
      });

      it('should record the section and the stage', () => {
        expect(result.toString()).toBe('section=guards&stage=guard-guard-1');
      });
    });
  });
});
