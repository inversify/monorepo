import { beforeAll, describe, expect, it } from 'vitest';

import { type CompletedCallsFindQuery } from '../../../application/models/CallsFindQuery.js';
import { CallsFindQueryFromCallIdBuilder } from './CallsFindQueryFromCallIdBuilder.js';

describe(CallsFindQueryFromCallIdBuilder, () => {
  let callsFindQueryFromCallIdBuilder: CallsFindQueryFromCallIdBuilder;

  beforeAll(() => {
    callsFindQueryFromCallIdBuilder = new CallsFindQueryFromCallIdBuilder();
  });

  describe('.build', () => {
    describe('having a call id', () => {
      let callIdFixture: string;

      beforeAll(() => {
        callIdFixture = 'call-id';
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = callsFindQueryFromCallIdBuilder.build(callIdFixture);
        });

        it('should return a CompletedCallsFindQuery', () => {
          const expected: CompletedCallsFindQuery = {
            filter: {
              id: callIdFixture,
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
