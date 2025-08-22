import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { isResponse } from '../Response';
import { StatusCode } from '../StatusCode';
import { ErrorResponse } from './ErrorResponse';

describe(ErrorResponse, () => {
  describe('.constructor', () => {
    describe('having statusCode, error and message', () => {
      let statusCodeFixture: StatusCode;
      let errorFixture: string;
      let messageFixture: string;

      beforeAll(() => {
        statusCodeFixture = StatusCode.BAD_REQUEST;
        errorFixture = 'Bad Request';
        messageFixture = 'Invalid input';
      });

      describe('when called', () => {
        let result: ErrorResponse;

        beforeAll(() => {
          result = new ErrorResponse(
            statusCodeFixture,
            errorFixture,
            messageFixture,
          );
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should set the statusCode', () => {
          expect(result.statusCode).toBe(statusCodeFixture);
        });

        it('should set the body including error, message and statusCode', () => {
          expect(result.body).toStrictEqual({
            error: errorFixture,
            message: messageFixture,
            statusCode: statusCodeFixture,
          });
        });

        it('should mark the instance as Response', () => {
          expect(result[isResponse]).toBe(true);
        });
      });
    });
  });

  describe('.is', () => {
    describe('having a non Object', () => {
      let notAnResponse: unknown;

      beforeAll(() => {
        notAnResponse = undefined;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = ErrorResponse.is(notAnResponse);
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
          result = ErrorResponse.is(notAnResponse);
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
          result = ErrorResponse.is(notAnResponse);
        });

        it('should return false', () => {
          expect(result).toBe(false);
        });
      });
    });

    describe('having an ErrorResponse', () => {
      let errorResponse: ErrorResponse;

      beforeAll(() => {
        errorResponse = new ErrorResponse(StatusCode.NOT_FOUND, 'Not Found');
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = ErrorResponse.is(errorResponse);
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
