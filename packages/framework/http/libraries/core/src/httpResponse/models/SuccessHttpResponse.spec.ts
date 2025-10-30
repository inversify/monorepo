import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { HttpStatusCode } from '../../http/models/HttpStatusCode';
import { isHttpResponse } from '../models/HttpResponse';
import { SuccessHttpResponse } from './SuccessHttpResponse';

describe(SuccessHttpResponse, () => {
  describe('.constructor', () => {
    describe('having a status code and a body', () => {
      let statusCodeFixture: HttpStatusCode;
      let bodyFixture: object;

      beforeAll(() => {
        statusCodeFixture = HttpStatusCode.OK;
        bodyFixture = { foo: 'bar' };
      });

      describe('when called', () => {
        let result: SuccessHttpResponse;

        beforeAll(() => {
          result = new SuccessHttpResponse(statusCodeFixture, bodyFixture);
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

        it('should mark the instance as HttpResponse', () => {
          expect(result[isHttpResponse]).toBe(true);
        });
      });
    });

    describe('having only a status code', () => {
      let statusCodeFixture: HttpStatusCode;

      beforeAll(() => {
        statusCodeFixture = HttpStatusCode.NO_CONTENT;
      });

      describe('when called', () => {
        let result: SuccessHttpResponse;

        beforeAll(() => {
          result = new SuccessHttpResponse(statusCodeFixture);
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

        it('should mark the instance as HttpResponse', () => {
          expect(result[isHttpResponse]).toBe(true);
        });
      });
    });
  });
});
