import { beforeAll, describe, expect, it } from 'vitest';

import { type InsightsFindQuery } from '../../../application/models/InsightsFindQuery.js';
import { type GetInsightsV1Query } from '../schemas/GetInsightsV1Query.js';
import { InsightsFindQueryFromGetInsightsV1QueryBuilder } from './InsightsFindQueryFromGetInsightsV1QueryBuilder.js';

describe(InsightsFindQueryFromGetInsightsV1QueryBuilder, () => {
  let insightsFindQueryFromGetInsightsV1QueryBuilder: InsightsFindQueryFromGetInsightsV1QueryBuilder;

  beforeAll(() => {
    insightsFindQueryFromGetInsightsV1QueryBuilder =
      new InsightsFindQueryFromGetInsightsV1QueryBuilder();
  });

  describe('.build', () => {
    describe('having a query with no sort', () => {
      let queryFixture: GetInsightsV1Query;

      beforeAll(() => {
        queryFixture = {
          page: 2,
          pageSize: 10,
        };
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result =
            insightsFindQueryFromGetInsightsV1QueryBuilder.build(queryFixture);
        });

        it('should return an InsightsFindQuery', () => {
          const expected: InsightsFindQuery = {
            limit: 10,
            offset: 10,
            request: {
              method: undefined,
              urlLike: undefined,
            },
            response: {
              statusCode: undefined,
            },
            sort: undefined,
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a query sorted by startedAt ascending', () => {
      let queryFixture: GetInsightsV1Query;

      beforeAll(() => {
        queryFixture = {
          page: 1,
          pageSize: 20,
          sort: 'startedAtAsc',
        };
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result =
            insightsFindQueryFromGetInsightsV1QueryBuilder.build(queryFixture);
        });

        it('should return an InsightsFindQuery', () => {
          const expected: InsightsFindQuery = {
            limit: 20,
            offset: 0,
            request: {
              method: undefined,
              urlLike: undefined,
            },
            response: {
              statusCode: undefined,
            },
            sort: 'startedAtAsc',
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });

    describe('having a query sorted by startedAt descending', () => {
      let queryFixture: GetInsightsV1Query;

      beforeAll(() => {
        queryFixture = {
          page: 1,
          pageSize: 20,
          sort: 'startedAtDesc',
        };
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result =
            insightsFindQueryFromGetInsightsV1QueryBuilder.build(queryFixture);
        });

        it('should return an InsightsFindQuery', () => {
          const expected: InsightsFindQuery = {
            limit: 20,
            offset: 0,
            request: {
              method: undefined,
              urlLike: undefined,
            },
            response: {
              statusCode: undefined,
            },
            sort: 'startedAtDesc',
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });
  });
});
