import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { isHttpResponse } from '../HttpResponse';
import { HttpStatusCode } from '../HttpStatusCode';
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

  describe('.is', () => {
    describe('having a non object', () => {
      let notAnHttpResponse: unknown;

      beforeAll(() => {
        notAnHttpResponse = undefined;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = SuccessHttpResponse.is(notAnHttpResponse);
        });

        it('should return false', () => {
          expect(result).toBe(false);
        });
      });
    });

    describe('having null', () => {
      let notAnHttpResponse: unknown;

      beforeAll(() => {
        notAnHttpResponse = null;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = SuccessHttpResponse.is(notAnHttpResponse);
        });

        it('should return false', () => {
          expect(result).toBe(false);
        });
      });
    });

    describe('having a non HttpResponse object', () => {
      let notAnHttpResponse: unknown;

      beforeAll(() => {
        notAnHttpResponse = {};
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = SuccessHttpResponse.is(notAnHttpResponse);
        });

        it('should return false', () => {
          expect(result).toBe(false);
        });
      });
    });

    describe('having a SuccessHttpResponse', () => {
      let successHttpResponse: SuccessHttpResponse;

      beforeAll(() => {
        successHttpResponse = new SuccessHttpResponse(HttpStatusCode.OK);
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = SuccessHttpResponse.is(successHttpResponse);
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
