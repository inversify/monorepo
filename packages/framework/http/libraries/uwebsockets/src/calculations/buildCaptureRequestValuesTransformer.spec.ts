import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('./buildCapturedRequest.js'));
vitest.mock(import('./resolveControllerMethodParamNameList.js'));

import { type CustomParameterDecoratorHandlerOptions } from '@inversifyjs/http-core';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

import { type CapturedRequestValues } from '../models/CapturedRequestValues.js';
import { type RequestTransformer } from '../models/RequestTransformer.js';
import { buildCapturedRequest } from './buildCapturedRequest.js';
import { buildCaptureRequestValuesTransformer } from './buildCaptureRequestValuesTransformer.js';
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
  let optionsMock: CustomParameterDecoratorHandlerOptions<
    HttpRequest,
    HttpResponse
  >;
  let responseFixture: HttpResponse;

  beforeAll(() => {
    capturedRequestFixture = {} as HttpRequest;
    responseFixture = {} as HttpResponse;

    optionsMock = {
      getBody: vitest.fn(),
    } as unknown as CustomParameterDecoratorHandlerOptions<
      HttpRequest,
      HttpResponse
    >;

    vitest.mocked(buildCapturedRequest).mockReturnValue(capturedRequestFixture);
  });

  describe('having a synchronous request value kind list', () => {
    let requestTransformer: RequestTransformer;

    beforeAll(() => {
      requestTransformer = buildCaptureRequestValuesTransformer(
        TestController,
        'testMethod',
        ['headers', 'method', 'query', 'url'],
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
          optionsMock,
        );
      });

      afterAll(() => {
        vitest.mocked(buildCapturedRequest).mockClear();
      });

      it('should not read the body', () => {
        expect(optionsMock.getBody).not.toHaveBeenCalled();
      });

      it('should call buildCapturedRequest() with the captured values', () => {
        const expected: CapturedRequestValues = {
          body: undefined,
          caseSensitiveMethod: 'POST',
          headers: { 'content-type': 'application/json' },
          method: 'post',
          paramNameList: undefined,
          params: undefined,
          query: 'first=1',
          url: '/users/user-1',
        };

        expect(buildCapturedRequest).toHaveBeenCalledExactlyOnceWith(expected);
      });

      it('should return the captured request', () => {
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
        ['params'],
      );
    });

    describe('when called twice', () => {
      let firstResult: unknown;
      let secondResult: unknown;

      beforeAll(() => {
        firstResult = requestTransformer(
          buildNativeRequestMock(),
          responseFixture,
          optionsMock,
        );
        secondResult = requestTransformer(
          buildNativeRequestMock(),
          responseFixture,
          optionsMock,
        );
      });

      afterAll(() => {
        vitest.mocked(buildCapturedRequest).mockClear();
        vitest.mocked(resolveControllerMethodParamNameList).mockClear();
      });

      it('should resolve the param names once', () => {
        expect(
          resolveControllerMethodParamNameList,
        ).toHaveBeenCalledExactlyOnceWith(TestController, 'testMethod');
      });

      it('should call buildCapturedRequest() with the captured params', () => {
        const expected: CapturedRequestValues = {
          body: undefined,
          caseSensitiveMethod: undefined,
          headers: undefined,
          method: undefined,
          paramNameList: ['userId'],
          params: { userId: 'user-1' },
          query: undefined,
          url: undefined,
        };

        expect(buildCapturedRequest).toHaveBeenCalledTimes(2);
        expect(buildCapturedRequest).toHaveBeenNthCalledWith(1, expected);
        expect(buildCapturedRequest).toHaveBeenNthCalledWith(2, expected);
      });

      it('should return the captured request', () => {
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
        ['body', 'method'],
      );
    });

    describe('when called', () => {
      let bodyFixture: unknown;
      let nativeRequestMock: HttpRequest;
      let result: unknown;

      beforeAll(async () => {
        bodyFixture = { name: 'warrior' };
        nativeRequestMock = buildNativeRequestMock();

        vitest.mocked(optionsMock.getBody).mockResolvedValueOnce(bodyFixture);

        result = await requestTransformer(
          nativeRequestMock,
          responseFixture,
          optionsMock,
        );
      });

      afterAll(() => {
        vitest.mocked(buildCapturedRequest).mockClear();
        vitest.mocked(optionsMock.getBody).mockClear();
      });

      it('should call options.getBody() with the native request', () => {
        expect(optionsMock.getBody).toHaveBeenCalledExactlyOnceWith(
          nativeRequestMock,
          responseFixture,
        );
      });

      it('should call buildCapturedRequest() with the captured body', () => {
        const expected: CapturedRequestValues = {
          body: { value: bodyFixture },
          caseSensitiveMethod: 'POST',
          headers: undefined,
          method: 'post',
          paramNameList: undefined,
          params: undefined,
          query: undefined,
          url: undefined,
        };

        expect(buildCapturedRequest).toHaveBeenCalledExactlyOnceWith(expected);
      });

      it('should return the captured request', () => {
        expect(result).toBe(capturedRequestFixture);
      });
    });
  });
});
