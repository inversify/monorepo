import { beforeAll, describe, expect, it } from 'vitest';

import { type CompletedExecutionsFindQuery } from '../../../application/models/ExecutionsFindQuery.js';
import { type GetInsightsV1Query } from '../schemas/GetInsightsV1Query.js';
import { ExecutionsFindQueryFromGetInsightsV1QueryBuilder } from './ExecutionsFindQueryFromGetInsightsV1QueryBuilder.js';

describe(ExecutionsFindQueryFromGetInsightsV1QueryBuilder, () => {
  let executionsFindQueryFromGetInsightsV1QueryBuilder: ExecutionsFindQueryFromGetInsightsV1QueryBuilder;

  beforeAll(() => {
    executionsFindQueryFromGetInsightsV1QueryBuilder =
      new ExecutionsFindQueryFromGetInsightsV1QueryBuilder();
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
            executionsFindQueryFromGetInsightsV1QueryBuilder.build(
              queryFixture,
            );
        });

        it('should return a CompletedExecutionsFindQuery', () => {
          const expected: CompletedExecutionsFindQuery = {
            filter: {
              id: undefined,
              request: {
                method: undefined,
                urlLike: undefined,
              },
              response: {
                statusCode: undefined,
              },
              sort: undefined,
            },
            limit: 10,
            offset: 10,
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
            executionsFindQueryFromGetInsightsV1QueryBuilder.build(
              queryFixture,
            );
        });

        it('should return a CompletedExecutionsFindQuery', () => {
          const expected: CompletedExecutionsFindQuery = {
            filter: {
              id: undefined,
              request: {
                method: undefined,
                urlLike: undefined,
              },
              response: {
                statusCode: undefined,
              },
              sort: 'startedAtAsc',
            },
            limit: 20,
            offset: 0,
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
            executionsFindQueryFromGetInsightsV1QueryBuilder.build(
              queryFixture,
            );
        });

        it('should return a CompletedExecutionsFindQuery', () => {
          const expected: CompletedExecutionsFindQuery = {
            filter: {
              id: undefined,
              request: {
                method: undefined,
                urlLike: undefined,
              },
              response: {
                statusCode: undefined,
              },
              sort: 'startedAtDesc',
            },
            limit: 20,
            offset: 0,
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });
  });
});
