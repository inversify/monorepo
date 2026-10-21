import { beforeAll, describe, expect, it } from 'vitest';

import {
  buildSearchWithCallFilters,
  readCallFilters,
} from './callFiltersSearch.js';
import { type CallFilters } from './callsApi.js';

describe(readCallFilters, () => {
  describe('having method and status query parameters', () => {
    describe('when called', () => {
      let result: CallFilters;

      beforeAll(() => {
        result = readCallFilters('?requestMethod=POST&responseStatusCode=400');
      });

      it('should return those filters', () => {
        expect(result).toStrictEqual({
          requestMethod: 'POST',
          responseStatusCode: 400,
        });
      });
    });
  });

  describe('having no filter query parameters', () => {
    describe('when called', () => {
      let result: CallFilters;

      beforeAll(() => {
        result = readCallFilters('?requestUrlLike=%2Fusers');
      });

      it('should return empty filters', () => {
        expect(result).toStrictEqual({
          requestMethod: undefined,
          responseStatusCode: undefined,
        });
      });
    });
  });

  describe('having a status that is not an integer', () => {
    describe('when called', () => {
      let result: CallFilters;

      beforeAll(() => {
        result = readCallFilters('?responseStatusCode=nope');
      });

      it('should ignore the status', () => {
        expect(result.responseStatusCode).toBeUndefined();
      });
    });
  });

  describe('having a status below 100', () => {
    describe('when called', () => {
      let result: CallFilters;

      beforeAll(() => {
        result = readCallFilters('?responseStatusCode=0');
      });

      it('should ignore the status', () => {
        expect(result.responseStatusCode).toBeUndefined();
      });
    });
  });

  describe('having a status above 599', () => {
    describe('when called', () => {
      let result: CallFilters;

      beforeAll(() => {
        result = readCallFilters('?responseStatusCode=600');
      });

      it('should ignore the status', () => {
        expect(result.responseStatusCode).toBeUndefined();
      });
    });
  });

  describe('having a status that does not fit in three digits', () => {
    describe('when called', () => {
      let result: CallFilters;

      beforeAll(() => {
        result = readCallFilters('?responseStatusCode=99999999999999999999');
      });

      it('should ignore the status', () => {
        expect(result.responseStatusCode).toBeUndefined();
      });
    });
  });

  describe('having the lowest valid status', () => {
    describe('when called', () => {
      let result: CallFilters;

      beforeAll(() => {
        result = readCallFilters('?responseStatusCode=100');
      });

      it('should return that status', () => {
        expect(result.responseStatusCode).toBe(100);
      });
    });
  });

  describe('having the highest valid status', () => {
    describe('when called', () => {
      let result: CallFilters;

      beforeAll(() => {
        result = readCallFilters('?responseStatusCode=599');
      });

      it('should return that status', () => {
        expect(result.responseStatusCode).toBe(599);
      });
    });
  });
});

describe(buildSearchWithCallFilters, () => {
  describe('having a requestUrlLike query parameter', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = buildSearchWithCallFilters('?requestUrlLike=%2Fusers', {
          requestMethod: 'POST',
          responseStatusCode: 400,
        });
      });

      it('should keep requestUrlLike and set the filters', () => {
        expect(result).toBe(
          '?requestUrlLike=%2Fusers&requestMethod=POST&responseStatusCode=400',
        );
      });
    });
  });

  describe('having empty filters', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = buildSearchWithCallFilters(
          '?requestMethod=POST&requestUrlLike=%2Fusers&responseStatusCode=400',
          {
            requestMethod: undefined,
            responseStatusCode: undefined,
          },
        );
      });

      it('should remove the filters and keep requestUrlLike', () => {
        expect(result).toBe('?requestUrlLike=%2Fusers');
      });
    });
  });
});
