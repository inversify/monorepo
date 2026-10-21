import { beforeAll, describe, expect, it } from 'vitest';

import { type GetCallsV1Query, getCallsV1Query } from './GetCallsV1Query.js';

describe('getCallsV1Query schema', () => {
  describe('.parse', () => {
    describe('having a response status code of 400', () => {
      describe('when called', () => {
        let result: GetCallsV1Query;

        beforeAll(() => {
          result = getCallsV1Query.parse({
            responseStatusCode: '400',
          });
        });

        it('should coerce the status code', () => {
          expect(result.responseStatusCode).toBe(400);
        });
      });
    });

    describe('having the lowest valid response status code', () => {
      describe('when called', () => {
        let result: GetCallsV1Query;

        beforeAll(() => {
          result = getCallsV1Query.parse({
            responseStatusCode: '100',
          });
        });

        it('should coerce the status code', () => {
          expect(result.responseStatusCode).toBe(100);
        });
      });
    });

    describe('having the highest valid response status code', () => {
      describe('when called', () => {
        let result: GetCallsV1Query;

        beforeAll(() => {
          result = getCallsV1Query.parse({
            responseStatusCode: '599',
          });
        });

        it('should coerce the status code', () => {
          expect(result.responseStatusCode).toBe(599);
        });
      });
    });

    describe('having no response status code', () => {
      describe('when called', () => {
        let result: GetCallsV1Query;

        beforeAll(() => {
          result = getCallsV1Query.parse({});
        });

        it('should leave the status code unset', () => {
          expect(result.responseStatusCode).toBeUndefined();
        });
      });
    });

    describe('having a response status code below 100', () => {
      describe('when called', () => {
        it('should throw', () => {
          expect(() => {
            getCallsV1Query.parse({
              responseStatusCode: '0',
            });
          }).toThrow('Too small: expected number to be >=100');
        });
      });
    });

    describe('having a response status code above 599', () => {
      describe('when called', () => {
        it('should throw', () => {
          expect(() => {
            getCallsV1Query.parse({
              responseStatusCode: '600',
            });
          }).toThrow('Too big: expected number to be <=599');
        });
      });
    });

    describe('having a response status code that does not fit in three digits', () => {
      describe('when called', () => {
        it('should throw', () => {
          expect(() => {
            getCallsV1Query.parse({
              responseStatusCode: '99999999999999999999',
            });
          }).toThrow('Too big: expected number to be <=599');
        });
      });
    });
  });
});
