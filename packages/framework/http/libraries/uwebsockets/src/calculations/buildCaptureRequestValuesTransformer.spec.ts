import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./buildCapturedRequest.js'));
vitest.mock(import('./installHttpResponseBodyCapture.js'));
vitest.mock(import('./resolveControllerMethodParamNameList.js'));

import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

import { type CapturedRequestValues } from '../models/CapturedRequestValues.js';
import { type RequestTransformer } from '../models/RequestTransformer.js';
import { RequestValueKind } from '../models/RequestValueKind.js';
import { buildCapturedRequest } from './buildCapturedRequest.js';
import { buildCaptureRequestValuesTransformer } from './buildCaptureRequestValuesTransformer.js';
import { installHttpResponseBodyCapture } from './installHttpResponseBodyCapture.js';
import { resolveControllerMethodParamNameList } from './resolveControllerMethodParamNameList.js';

class TestController {}

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

  describe('having a synchronous request value kind list', () => {
    let requestTransformer: RequestTransformer;

    beforeAll(() => {
      requestTransformer = buildCaptureRequestValuesTransformer(
        TestController,
        'testMethod',
        [
          RequestValueKind.Headers,
          RequestValueKind.Method,
          RequestValueKind.Query,
          RequestValueKind.Url,
        ],
      );
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
          contentType: undefined,
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

  describe('having a request value kind list with params', () => {
    let requestTransformer: RequestTransformer;

    beforeAll(() => {
      vitest
        .mocked(resolveControllerMethodParamNameList)
        .mockReturnValue(['userId']);

      requestTransformer = buildCaptureRequestValuesTransformer(
        TestController,
        'testMethod',
        [RequestValueKind.Params],
      );
    });

    describe('when called twice', () => {
      let firstNativeRequestMock: HttpRequest;
      let secondNativeRequestMock: HttpRequest;
      let firstResult: unknown;
      let secondResult: unknown;

      beforeAll(() => {
        firstNativeRequestMock = buildNativeRequestMock();
        secondNativeRequestMock = buildNativeRequestMock();

        firstResult = requestTransformer(
          firstNativeRequestMock,
          responseFixture,
          {} as never,
        );
        secondResult = requestTransformer(
          secondNativeRequestMock,
          responseFixture,
          {} as never,
        );
      });

      afterAll(() => {
        vitest.mocked(buildCapturedRequest).mockClear();
        vitest.mocked(resolveControllerMethodParamNameList).mockClear();
      });

      it('should resolve the param names once', () => {
        expect(
          resolveControllerMethodParamNameList,
        ).toHaveBeenCalledExactlyOnceWith(
          TestController,
          'testMethod',
          undefined,
        );
      });

      it('should call buildCapturedRequest() with the captured params', () => {
        const expected: CapturedRequestValues = {
          caseSensitiveMethod: undefined,
          contentType: undefined,
          headers: undefined,
          method: undefined,
          paramNameList: ['userId'],
          params: { userId: 'user-1' },
          query: undefined,
          url: undefined,
        };

        expect(buildCapturedRequest).toHaveBeenCalledTimes(2);
        expect(buildCapturedRequest).toHaveBeenNthCalledWith(
          1,
          firstNativeRequestMock,
          expected,
        );
        expect(buildCapturedRequest).toHaveBeenNthCalledWith(
          2,
          secondNativeRequestMock,
          expected,
        );
      });

      it('should return the captured request synchronously', () => {
        expect(firstResult).toBe(capturedRequestFixture);
        expect(secondResult).toBe(capturedRequestFixture);
      });
    });
  });

  describe('having a request value kind list with body', () => {
    let requestTransformer: RequestTransformer;

    beforeAll(() => {
      requestTransformer = buildCaptureRequestValuesTransformer(
        TestController,
        'testMethod',
        [RequestValueKind.Body, RequestValueKind.Method],
      );
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

      it('should install body capture synchronously', () => {
        expect(installHttpResponseBodyCapture).toHaveBeenCalledExactlyOnceWith(
          responseFixture,
        );
      });

      it('should call buildCapturedRequest() with the native request and captured values', () => {
        const expected: CapturedRequestValues = {
          caseSensitiveMethod: 'POST',
          contentType: '',
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

      it('should return the captured request synchronously', () => {
        expect(result).toBe(capturedRequestFixture);
      });
    });
  });
});
