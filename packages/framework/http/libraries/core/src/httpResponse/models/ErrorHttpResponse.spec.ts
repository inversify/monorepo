import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { ErrorHttpResponse } from './ErrorHttpResponse';
import { isHttpResponse } from './HttpResponse';

describe(ErrorHttpResponse, () => {
  describe('.constructor', () => {
    describe('having statusCode and body', () => {
      let statusCodeFixture: HttpStatusCode;
      let bodyFixture: string;

      beforeAll(() => {
        statusCodeFixture = HttpStatusCode.BAD_REQUEST;
        bodyFixture = 'Bad Request';
      });

      describe('when called', () => {
        let result: ErrorHttpResponse;

        beforeAll(() => {
          result = new ErrorHttpResponse(statusCodeFixture, bodyFixture);
        });

        afterAll(() => {
          vitest.clearAllMocks();
        });

        it('should set the statusCode', () => {
          expect(result.statusCode).toBe(statusCodeFixture);
        });

        it('should set the body including error, message and statusCode', () => {
          expect(result.body).toBe(bodyFixture);
        });

        it('should mark the instance as HttpResponse', () => {
          expect(result[isHttpResponse]).toBe(true);
        });
      });
    });
  });
});
