import { HttpStatusCode } from './HttpStatusCode';

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
  getParams: (request: TRequest, parameterName?: string) => unknown;
  getQuery: (request: TRequest, parameterName?: string) => unknown;
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
