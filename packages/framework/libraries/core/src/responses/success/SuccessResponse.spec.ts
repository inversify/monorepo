import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { isResponse } from '../Response';
import { StatusCode } from '../StatusCode';
import { SuccessResponse } from './SuccessResponse';

describe(SuccessResponse, () => {
  describe('.constructor', () => {
    describe('having a status code and a body', () => {
      let statusCodeFixture: StatusCode;
      let bodyFixture: object;

      beforeAll(() => {
        statusCodeFixture = StatusCode.OK;
        bodyFixture = { foo: 'bar' };
      });

      describe('when called', () => {
        let result: SuccessResponse;

        beforeAll(() => {
          result = new SuccessResponse(statusCodeFixture, bodyFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should set the statusCode', () => {
          expect(result.statusCode).toBe(statusCodeFixture);
        });

        it('should set the body', () => {
          expect(result.body).toBe(bodyFixture);
        });

        it('should mark the instance as Response', () => {
          expect(result[isResponse]).toBe(true);
        });
      });
    });

    describe('having only a status code', () => {
      let statusCodeFixture: StatusCode;

      beforeAll(() => {
        statusCodeFixture = StatusCode.NO_CONTENT;
      });

      describe('when called', () => {
        let result: SuccessResponse;

        beforeAll(() => {
          result = new SuccessResponse(statusCodeFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should set the statusCode', () => {
          expect(result.statusCode).toBe(statusCodeFixture);
        });

        it('should not set a body', () => {
          expect(result.body).toBeUndefined();
        });

        it('should mark the instance as Response', () => {
          expect(result[isResponse]).toBe(true);
        });
      });
    });
  });

  describe('.is', () => {
    describe('having a non object', () => {
      let notAnResponse: unknown;

      beforeAll(() => {
        notAnResponse = undefined;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = SuccessResponse.is(notAnResponse);
        });

        it('should return false', () => {
          expect(result).toBe(false);
        });
      });
    });

    describe('having null', () => {
      let notAnResponse: unknown;

      beforeAll(() => {
        notAnResponse = null;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = SuccessResponse.is(notAnResponse);
        });

        it('should return false', () => {
          expect(result).toBe(false);
        });
      });
    });

    describe('having a non Response object', () => {
      let notAnResponse: unknown;

      beforeAll(() => {
        notAnResponse = {};
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = SuccessResponse.is(notAnResponse);
        });

        it('should return false', () => {
          expect(result).toBe(false);
        });
      });
    });

    describe('having a SuccessResponse', () => {
      let successResponse: SuccessResponse;

      beforeAll(() => {
        successResponse = new SuccessResponse(StatusCode.OK);
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = SuccessResponse.is(successResponse);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should return true', () => {
          expect(result).toBe(true);
        });
      });
    });
  });
});
