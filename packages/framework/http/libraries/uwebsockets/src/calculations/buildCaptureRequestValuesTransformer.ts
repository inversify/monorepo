import { type CustomParameterDecoratorHandlerOptions } from '@inversifyjs/http-core';
import { type HttpRequest, type HttpResponse } from 'uWebSockets.js';

import { type CapturedRequestValues } from '../models/CapturedRequestValues.js';
import { type CaptureRequestValuesOptions } from '../models/CaptureRequestValuesOptions.js';
import { type RequestTransformer } from '../models/RequestTransformer.js';
import { buildCapturedRequest } from './buildCapturedRequest.js';

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
  options: CaptureRequestValuesOptions,
): RequestTransformer<HttpRequest, HttpResponse> {
  const captureHeadersValues: boolean = options.headers === true;
  const captureMethod: boolean = options.method === true;
  const captureUrl: boolean = options.url === true;
  const captureQuery: boolean = options.query === true || captureUrl;
  const paramNameList: string[] | undefined = Array.isArray(options.params)
    ? options.params
    : undefined;

  return (
    request: HttpRequest,
    _response: HttpResponse,
    _options: CustomParameterDecoratorHandlerOptions<HttpRequest, HttpResponse>,
  ): HttpRequest => {
    const capturedRequestValues: CapturedRequestValues = {
      caseSensitiveMethod: undefined,
      headers: undefined,
      method: undefined,
      paramNameList: undefined,
      params: undefined,
      query: undefined,
      url: undefined,
    };

    if (captureHeadersValues) {
      capturedRequestValues.headers = captureHeaders(request);
    }

    if (captureMethod) {
      capturedRequestValues.caseSensitiveMethod =
        request.getCaseSensitiveMethod();
      capturedRequestValues.method = request.getMethod();
    }

    /*
     * The raw query string is part of the URL, so it is captured whenever the
     * URL is captured. Otherwise `_getUrl` would not be able to rebuild the
     * URL including its query string.
     */
    if (captureQuery) {
      capturedRequestValues.query = request.getQuery();
    }

    if (captureUrl) {
      capturedRequestValues.url = request.getUrl();
    }

    if (paramNameList !== undefined) {
      capturedRequestValues.paramNameList = paramNameList;
      capturedRequestValues.params = captureParams(request, paramNameList);
    }

    return buildCapturedRequest(request, capturedRequestValues);
  };
}
