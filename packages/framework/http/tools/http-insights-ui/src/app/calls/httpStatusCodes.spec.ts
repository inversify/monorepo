import { beforeAll, describe, expect, it } from 'vitest';

import {
  filterHttpStatusCodes,
  HTTP_STATUS_CODES,
  type HttpStatusCode,
} from './httpStatusCodes.js';

describe(filterHttpStatusCodes, () => {
  describe('having an empty query', () => {
    describe('when called', () => {
      let result: readonly HttpStatusCode[];

      beforeAll(() => {
        result = filterHttpStatusCodes('  ');
      });

      it('should return every status code', () => {
        expect(result).toBe(HTTP_STATUS_CODES);
      });
    });
  });

  describe('having a reason phrase fragment', () => {
    describe('when called', () => {
      let result: readonly HttpStatusCode[];

      beforeAll(() => {
        result = filterHttpStatusCodes('Bad');
      });

      it('should return statuses whose reason includes the fragment', () => {
        expect(
          result.map((status: HttpStatusCode): number => status.code),
        ).toStrictEqual([400, 502]);
      });
    });
  });

  describe('having a status code', () => {
    describe('when called', () => {
      let result: readonly HttpStatusCode[];

      beforeAll(() => {
        result = filterHttpStatusCodes('400');
      });

      it('should return that status code', () => {
        expect(result).toStrictEqual([
          {
            code: 400,
            reason: 'Bad Request',
          },
        ]);
      });
    });
  });

  describe('having a status code prefix', () => {
    describe('when called', () => {
      let result: readonly HttpStatusCode[];

      beforeAll(() => {
        result = filterHttpStatusCodes('4');
      });

      it('should return statuses in that class', () => {
        expect(
          result.every((status: HttpStatusCode): boolean =>
            String(status.code).startsWith('4'),
          ),
        ).toBe(true);
        expect(
          result.some((status: HttpStatusCode): boolean => status.code === 400),
        ).toBe(true);
        expect(
          result.some((status: HttpStatusCode): boolean => status.code === 204),
        ).toBe(false);
      });
    });
  });
});
