import { beforeAll, describe, expect, it } from 'vitest';

import {
  buildSearchWithExecutionFilters,
  readExecutionFilters,
} from './executionFiltersSearch.js';
import { type ExecutionFilters } from './executionsApi.js';

describe(readExecutionFilters, () => {
  describe('having method and status query parameters', () => {
    describe('when called', () => {
      let result: ExecutionFilters;

      beforeAll(() => {
        result = readExecutionFilters(
          '?requestMethod=POST&responseStatusCode=400',
        );
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
      let result: ExecutionFilters;

      beforeAll(() => {
        result = readExecutionFilters('?requestUrlLike=%2Fusers');
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
      let result: ExecutionFilters;

      beforeAll(() => {
        result = readExecutionFilters('?responseStatusCode=nope');
      });

      it('should ignore the status', () => {
        expect(result.responseStatusCode).toBeUndefined();
      });
    });
  });
});

describe(buildSearchWithExecutionFilters, () => {
  describe('having a requestUrlLike query parameter', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = buildSearchWithExecutionFilters('?requestUrlLike=%2Fusers', {
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
        result = buildSearchWithExecutionFilters(
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
