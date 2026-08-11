import { type CustomParameterDecoratorHandlerOptions } from '@inversifyjs/http-core';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

import { routePathSymbol } from '../data/routePathSymbol.js';
import { type CapturedRequestValues } from '../models/CapturedRequestValues.js';
import { type CustomHttpResponse } from '../models/CustomHttpResponse.js';
import { type RequestTransformer } from '../models/RequestTransformer.js';
import { RequestValueKind } from '../models/RequestValueKind.js';
import { buildCapturedRequest } from './buildCapturedRequest.js';
import { installHttpResponseBodyCapture } from './installHttpResponseBodyCapture.js';
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

  const cachedParamNameListByRoutePath: Map<string, string[]> = new Map();

  return (
    request: HttpRequest,
    response: HttpResponse,
    _options: CustomParameterDecoratorHandlerOptions<HttpRequest, HttpResponse>,
  ): HttpRequest => {
    const capturedRequestValues: CapturedRequestValues = {
      caseSensitiveMethod: undefined,
      contentType: undefined,
      headers: undefined,
      method: undefined,
      paramNameList: undefined,
      params: undefined,
      query: undefined,
      url: undefined,
    };

    if (requestValueKindSet.has(RequestValueKind.Headers)) {
      capturedRequestValues.headers = captureHeaders(request);
    }

    /*
     * Body parsing reads content-type through `_getBody`. Preserve it without
     * populating a partial headers snapshot, so uncaptured header APIs still
     * report that headers were not captured.
     */
    if (requestValueKindSet.has(RequestValueKind.Body)) {
      capturedRequestValues.contentType = request.getHeader('content-type');
    }

    if (requestValueKindSet.has(RequestValueKind.Method)) {
      capturedRequestValues.caseSensitiveMethod =
        request.getCaseSensitiveMethod();
      capturedRequestValues.method = request.getMethod();
    }

    /*
     * The raw query string is part of the URL, so it is captured whenever the
     * URL is captured. Otherwise `_getUrl` would not be able to rebuild the
     * URL including its query string.
     */
    if (
      requestValueKindSet.has(RequestValueKind.Query) ||
      requestValueKindSet.has(RequestValueKind.Url)
    ) {
      capturedRequestValues.query = request.getQuery();
    }

    if (requestValueKindSet.has(RequestValueKind.Url)) {
      capturedRequestValues.url = request.getUrl();
    }

    if (requestValueKindSet.has(RequestValueKind.Params)) {
      const routePath: string | undefined = (response as CustomHttpResponse)[
        routePathSymbol
      ];
      const cacheKey: string = routePath ?? '';

      let cachedParamNameList: string[] | undefined =
        cachedParamNameListByRoutePath.get(cacheKey);

      if (cachedParamNameList === undefined) {
        cachedParamNameList = resolveControllerMethodParamNameList(
          controllerConstructor,
          methodKey,
          routePath,
        );
        cachedParamNameListByRoutePath.set(cacheKey, cachedParamNameList);
      }

      capturedRequestValues.paramNameList = cachedParamNameList;
      capturedRequestValues.params = captureParams(
        request,
        cachedParamNameList,
      );
    }

    if (requestValueKindSet.has(RequestValueKind.Body)) {
      installHttpResponseBodyCapture(response);
    }

    return buildCapturedRequest(request, capturedRequestValues);
  };
}
