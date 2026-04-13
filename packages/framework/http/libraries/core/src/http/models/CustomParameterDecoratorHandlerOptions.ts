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
  getHeaders: ((
    request: TRequest,
  ) => Record<string, string | string[] | undefined>) &
    ((
      request: TRequest,
      parameterName: string,
    ) => string | string[] | undefined);
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
