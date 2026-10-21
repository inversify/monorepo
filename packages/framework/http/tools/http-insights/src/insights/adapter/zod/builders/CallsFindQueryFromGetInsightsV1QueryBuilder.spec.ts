import { beforeAll, describe, expect, it } from 'vitest';

import { type CompletedCallsFindQuery } from '../../../application/models/CallsFindQuery.js';
import { type GetCallsV1Query } from '../schemas/GetCallsV1Query.js';
import { CallsFindQueryFromGetInsightsV1QueryBuilder } from './CallsFindQueryFromGetInsightsV1QueryBuilder.js';

describe(CallsFindQueryFromGetInsightsV1QueryBuilder, () => {
  let callsFindQueryFromGetInsightsV1QueryBuilder: CallsFindQueryFromGetInsightsV1QueryBuilder;

  beforeAll(() => {
    callsFindQueryFromGetInsightsV1QueryBuilder =
      new CallsFindQueryFromGetInsightsV1QueryBuilder();
  });

  describe('.build', () => {
    describe('having a query with no sort', () => {
      let queryFixture: GetCallsV1Query;

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
            callsFindQueryFromGetInsightsV1QueryBuilder.build(queryFixture);
        });

        it('should return a CompletedCallsFindQuery', () => {
          const expected: CompletedCallsFindQuery = {
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
      let queryFixture: GetCallsV1Query;

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
            callsFindQueryFromGetInsightsV1QueryBuilder.build(queryFixture);
        });

        it('should return a CompletedCallsFindQuery', () => {
          const expected: CompletedCallsFindQuery = {
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
      let queryFixture: GetCallsV1Query;

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
            callsFindQueryFromGetInsightsV1QueryBuilder.build(queryFixture);
        });

        it('should return a CompletedCallsFindQuery', () => {
          const expected: CompletedCallsFindQuery = {
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
