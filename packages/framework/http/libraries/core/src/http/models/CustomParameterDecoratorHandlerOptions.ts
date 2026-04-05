import { type HttpStatusCode } from './HttpStatusCode.js';

export interface CustomParameterDecoratorHandlerOptions<TRequest, TResponse> {
  getBody: (
    request: TRequest,
    response: TResponse,
    parameterName?: string,
  ) => unknown;
  getCookies: (
    request: TRequest,
    response: TResponse,
    parameterName?: string,
  ) => unknown;
  getHeaders: (request: TRequest, parameterName?: string) => unknown;
  getMethod: (request: TRequest) => string;
  getParams: (request: TRequest, parameterName?: string) => unknown;
  getQuery: (request: TRequest, parameterName?: string) => unknown;
  getUrl: (request: TRequest) => string;
  setHeader(
    request: TRequest,
    response: TResponse,
    key: string,
    value: string,
  ): void;
  setStatus(
    request: TRequest,
    response: TResponse,
    statusCode: HttpStatusCode,
  ): void;
}
