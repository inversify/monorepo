import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./buildCapturedRequest.js'));
vitest.mock(import('./installHttpResponseBodyCapture.js'));

import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

import { type CapturedRequestValues } from '../models/CapturedRequestValues.js';
import { type RequestTransformer } from '../models/RequestTransformer.js';
import { buildCapturedRequest } from './buildCapturedRequest.js';
import { buildCaptureRequestValuesTransformer } from './buildCaptureRequestValuesTransformer.js';
import { installHttpResponseBodyCapture } from './installHttpResponseBodyCapture.js';

function buildNativeRequestMock(): HttpRequest {
  return {
    forEach: vitest.fn(
      (callback: (key: string, value: string) => void): void => {
        callback('content-type', 'application/json');
      },
    ),
    getCaseSensitiveMethod: vitest.fn().mockReturnValue('POST'),
    getHeader: vitest.fn().mockReturnValue(''),
    getMethod: vitest.fn().mockReturnValue('post'),
    getParameter: vitest.fn((index: number | string): string | undefined =>
      index === 'userId' ? 'user-1' : undefined,
    ),
    getQuery: vitest.fn().mockReturnValue('first=1'),
    getUrl: vitest.fn().mockReturnValue('/users/user-1'),
    setYield: vitest.fn(),
  };
}

describe(buildCaptureRequestValuesTransformer, () => {
  let capturedRequestFixture: HttpRequest;
  let responseFixture: HttpResponse;

  beforeAll(() => {
    capturedRequestFixture = {} as HttpRequest;
    responseFixture = {} as HttpResponse;

    vitest.mocked(buildCapturedRequest).mockReturnValue(capturedRequestFixture);
  });

  describe('having headers, method, query and url options', () => {
    let requestTransformer: RequestTransformer<HttpRequest, HttpResponse>;

    beforeAll(() => {
      requestTransformer = buildCaptureRequestValuesTransformer({
        headers: true,
        method: true,
        query: true,
        url: true,
      });
    });

    describe('when called', () => {
      let nativeRequestMock: HttpRequest;
      let result: unknown;

      beforeAll(() => {
        nativeRequestMock = buildNativeRequestMock();

        result = requestTransformer(
          nativeRequestMock,
          responseFixture,
          {} as never,
        );
      });

      afterAll(() => {
        vitest.mocked(buildCapturedRequest).mockClear();
        vitest.mocked(installHttpResponseBodyCapture).mockClear();
      });

      it('should not capture the response body', () => {
        expect(installHttpResponseBodyCapture).not.toHaveBeenCalled();
      });

      it('should call buildCapturedRequest() with the native request and captured values', () => {
        const expected: CapturedRequestValues = {
          caseSensitiveMethod: 'POST',
          headers: { 'content-type': 'application/json' },
          method: 'post',
          paramNameList: undefined,
          params: undefined,
          query: 'first=1',
          url: '/users/user-1',
        };

        expect(buildCapturedRequest).toHaveBeenCalledExactlyOnceWith(
          nativeRequestMock,
          expected,
        );
      });

      it('should return the captured request synchronously', () => {
        expect(result).toBe(capturedRequestFixture);
      });
    });
  });

  describe('having explicit params', () => {
    let requestTransformer: RequestTransformer<HttpRequest, HttpResponse>;

    beforeAll(() => {
      requestTransformer = buildCaptureRequestValuesTransformer({
        params: ['userId'],
      });
    });

    describe('when called', () => {
      let nativeRequestMock: HttpRequest;
      let result: unknown;

      beforeAll(() => {
        nativeRequestMock = buildNativeRequestMock();

        result = requestTransformer(
          nativeRequestMock,
          responseFixture,
          {} as never,
        );
      });

      afterAll(() => {
        vitest.mocked(buildCapturedRequest).mockClear();
      });

      it('should call buildCapturedRequest() with the captured params', () => {
        const expected: CapturedRequestValues = {
          caseSensitiveMethod: undefined,
          headers: undefined,
          method: undefined,
          paramNameList: ['userId'],
          params: { userId: 'user-1' },
          query: undefined,
          url: undefined,
        };

        expect(buildCapturedRequest).toHaveBeenCalledExactlyOnceWith(
          nativeRequestMock,
          expected,
        );
      });

      it('should return the captured request synchronously', () => {
        expect(result).toBe(capturedRequestFixture);
      });
    });
  });

  describe('having params set to false', () => {
    let requestTransformer: RequestTransformer<HttpRequest, HttpResponse>;

    beforeAll(() => {
      requestTransformer = buildCaptureRequestValuesTransformer({
        method: true,
        params: false,
      });
    });

    describe('when called', () => {
      let nativeRequestMock: HttpRequest;

      beforeAll(() => {
        nativeRequestMock = buildNativeRequestMock();

        void requestTransformer(
          nativeRequestMock,
          responseFixture,
          {} as never,
        );
      });

      afterAll(() => {
        vitest.mocked(buildCapturedRequest).mockClear();
      });

      it('should not capture params', () => {
        const expected: CapturedRequestValues = {
          caseSensitiveMethod: 'POST',
          headers: undefined,
          method: 'post',
          paramNameList: undefined,
          params: undefined,
          query: undefined,
          url: undefined,
        };

        expect(buildCapturedRequest).toHaveBeenCalledExactlyOnceWith(
          nativeRequestMock,
          expected,
        );
      });
    });
  });

  describe('having body true', () => {
    let requestTransformer: RequestTransformer<HttpRequest, HttpResponse>;

    beforeAll(() => {
      requestTransformer = buildCaptureRequestValuesTransformer({
        body: true,
      });
    });

    describe('when called', () => {
      let nativeRequestMock: HttpRequest;
      let result: unknown;

      beforeAll(() => {
        nativeRequestMock = buildNativeRequestMock();

        result = requestTransformer(
          nativeRequestMock,
          responseFixture,
          {} as never,
        );
      });

      afterAll(() => {
        vitest.mocked(buildCapturedRequest).mockClear();
        vitest.mocked(installHttpResponseBodyCapture).mockClear();
      });

      it('should install response body capture', () => {
        expect(installHttpResponseBodyCapture).toHaveBeenCalledExactlyOnceWith(
          responseFixture,
        );
      });

      it('should imply headers capture', () => {
        const expected: CapturedRequestValues = {
          caseSensitiveMethod: undefined,
          headers: { 'content-type': 'application/json' },
          method: undefined,
          paramNameList: undefined,
          params: undefined,
          query: undefined,
          url: undefined,
        };

        expect(buildCapturedRequest).toHaveBeenCalledExactlyOnceWith(
          nativeRequestMock,
          expected,
        );
      });

      it('should return the captured request synchronously', () => {
        expect(result).toBe(capturedRequestFixture);
      });
    });
  });

  describe('having url true without query', () => {
    let requestTransformer: RequestTransformer<HttpRequest, HttpResponse>;

    beforeAll(() => {
      requestTransformer = buildCaptureRequestValuesTransformer({
        url: true,
      });
    });

    describe('when called', () => {
      let nativeRequestMock: HttpRequest;

      beforeAll(() => {
        nativeRequestMock = buildNativeRequestMock();

        void requestTransformer(
          nativeRequestMock,
          responseFixture,
          {} as never,
        );
      });

      afterAll(() => {
        vitest.mocked(buildCapturedRequest).mockClear();
      });

      it('should also capture the query string', () => {
        const expected: CapturedRequestValues = {
          caseSensitiveMethod: undefined,
          headers: undefined,
          method: undefined,
          paramNameList: undefined,
          params: undefined,
          query: 'first=1',
          url: '/users/user-1',
        };

        expect(buildCapturedRequest).toHaveBeenCalledExactlyOnceWith(
          nativeRequestMock,
          expected,
        );
      });
    });
  });
});
