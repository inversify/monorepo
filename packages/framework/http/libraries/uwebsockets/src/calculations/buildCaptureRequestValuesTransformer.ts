import { type CustomParameterDecoratorHandlerOptions } from '@inversifyjs/http-core';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

import { type CapturedRequestValues } from '../models/CapturedRequestValues.js';
import { type RequestTransformer } from '../models/RequestTransformer.js';
import { type RequestValueKind } from '../models/RequestValueKind.js';
import { buildCapturedRequest } from './buildCapturedRequest.js';
import { resolveControllerMethodParamNameList } from './resolveControllerMethodParamNameList.js';

const EMPTY_PARAM_VALUE: string = '';

function captureHeaders(request: HttpRequest): Record<string, string> {
  const headers: Record<string, string> = {};

  request.forEach((key: string, value: string): void => {
    headers[key] = value;
  });

  return headers;
}

function captureParams(
  request: HttpRequest,
  paramNameList: string[],
): Record<string, string> {
  const params: Record<string, string> = {};

  for (const paramName of paramNameList) {
    params[paramName] = request.getParameter(paramName) ?? EMPTY_PARAM_VALUE;
  }

  return params;
}

export function buildCaptureRequestValuesTransformer(
  controllerConstructor: NewableFunction,
  methodKey: string | symbol,
  requestValueKindList: RequestValueKind[],
): RequestTransformer {
  const requestValueKindSet: Set<RequestValueKind> = new Set(
    requestValueKindList,
  );

  let cachedParamNameList: string[] | undefined = undefined;

  return (
    request: HttpRequest,
    response: HttpResponse,
    options: CustomParameterDecoratorHandlerOptions<HttpRequest, HttpResponse>,
  ): HttpRequest | Promise<HttpRequest> => {
    const capturedRequestValues: CapturedRequestValues = {
      body: undefined,
      caseSensitiveMethod: undefined,
      headers: undefined,
      method: undefined,
      paramNameList: undefined,
      params: undefined,
      query: undefined,
      url: undefined,
    };

    if (requestValueKindSet.has('headers')) {
      capturedRequestValues.headers = captureHeaders(request);
    }

    if (requestValueKindSet.has('method')) {
      capturedRequestValues.caseSensitiveMethod =
        request.getCaseSensitiveMethod();
      capturedRequestValues.method = request.getMethod();
    }

    /*
     * The raw query string is part of the URL, so it is captured whenever the
     * URL is captured. Otherwise `_getUrl` would not be able to rebuild the
     * URL including its query string.
     */
    if (requestValueKindSet.has('query') || requestValueKindSet.has('url')) {
      capturedRequestValues.query = request.getQuery();
    }

    if (requestValueKindSet.has('url')) {
      capturedRequestValues.url = request.getUrl();
    }

    if (requestValueKindSet.has('params')) {
      cachedParamNameList ??= resolveControllerMethodParamNameList(
        controllerConstructor,
        methodKey,
      );

      capturedRequestValues.paramNameList = cachedParamNameList;
      capturedRequestValues.params = captureParams(
        request,
        cachedParamNameList,
      );
    }

    if (!requestValueKindSet.has('body')) {
      return buildCapturedRequest(capturedRequestValues);
    }

    const body: unknown = options.getBody(request, response);

    return (async (): Promise<HttpRequest> => {
      capturedRequestValues.body = { value: await body };

      return buildCapturedRequest(capturedRequestValues);
    })();
  };
}
