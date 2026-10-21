import { beforeAll, describe, expect, it } from 'vitest';

import { type CompletedExecutionsFindQuery } from '../../../application/models/ExecutionsFindQuery.js';
import { ExecutionsFindQueryFromInsightsIdBuilder } from './ExecutionsFindQueryFromInsightsIdBuilder.js';

describe(ExecutionsFindQueryFromInsightsIdBuilder, () => {
  let executionsFindQueryFromInsightsIdBuilder: ExecutionsFindQueryFromInsightsIdBuilder;

  beforeAll(() => {
    executionsFindQueryFromInsightsIdBuilder =
      new ExecutionsFindQueryFromInsightsIdBuilder();
  });

  describe('.build', () => {
    describe('having an insights id', () => {
      let insightsIdFixture: string;

      beforeAll(() => {
        insightsIdFixture = 'execution-id';
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result =
            executionsFindQueryFromInsightsIdBuilder.build(insightsIdFixture);
        });

        it('should return a CompletedExecutionsFindQuery', () => {
          const expected: CompletedExecutionsFindQuery = {
            filter: {
              id: insightsIdFixture,
              request: {
                method: undefined,
                urlLike: undefined,
              },
              response: {
                statusCode: undefined,
              },
              sort: undefined,
            },
            limit: 1,
            offset: undefined,
          };

          expect(result).toStrictEqual(expected);
        });
      });
    });
  });
});
