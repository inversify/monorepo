import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { isHttpResponse as isHttpResponseSymbol } from '../HttpResponse';
import { HttpStatusCode } from '../HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';

describe(ErrorHttpResponse, () => {
  describe('.constructor', () => {
    describe('having statusCode, error and message', () => {
      let statusCodeFixture: HttpStatusCode;
      let errorFixture: string;
      let messageFixture: string;

      beforeAll(() => {
        statusCodeFixture = HttpStatusCode.BAD_REQUEST;
        errorFixture = 'Bad Request';
        messageFixture = 'Invalid input';
      });

      describe('when called', () => {
        let result: ErrorHttpResponse;

        beforeAll(() => {
          result = new ErrorHttpResponse(
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

        it('should mark the instance as HttpResponse', () => {
          expect(result[isHttpResponseSymbol]).toBe(true);
        });
      });
    });
  });

  describe('.is', () => {
    describe('having a non HttpResponse', () => {
      let notAnHttpResponse: unknown;

      beforeAll(() => {
        notAnHttpResponse = undefined;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = ErrorHttpResponse.is(notAnHttpResponse);
        });

        it('should return false', () => {
          expect(result).toBe(false);
        });
      });
    });

    describe('having an ErrorHttpResponse with 4xx code', () => {
      let errorHttpResponse: ErrorHttpResponse;

      beforeAll(() => {
        errorHttpResponse = new ErrorHttpResponse(
          HttpStatusCode.NOT_FOUND,
          'Not Found',
        );
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = ErrorHttpResponse.is(errorHttpResponse);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should return true', () => {
          expect(result).toBe(true);
        });
      });
    });

    describe('having an ErrorHttpResponse with 5xx code', () => {
      let errorHttpResponse: ErrorHttpResponse;

      beforeAll(() => {
        errorHttpResponse = new ErrorHttpResponse(
          HttpStatusCode.INTERNAL_SERVER_ERROR,
          'Server Error',
        );
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = ErrorHttpResponse.is(errorHttpResponse);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should return true', () => {
          expect(result).toBe(true);
        });
      });
    });

    describe('having an ErrorHttpResponse with 600 boundary code', () => {
      let errorHttpResponse: ErrorHttpResponse;

      beforeAll(() => {
        errorHttpResponse = new ErrorHttpResponse(
          600 as HttpStatusCode,
          'Out of range',
        );
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = ErrorHttpResponse.is(errorHttpResponse);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should return false', () => {
          expect(result).toBe(false);
        });
      });
    });
  });
});
