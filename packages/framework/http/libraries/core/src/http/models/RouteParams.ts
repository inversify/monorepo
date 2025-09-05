import { MiddlewareHandler } from './MiddlewareHandler';
import { RequestHandler } from './RequestHandler';
import { RequestMethodType } from './RequestMethodType';

export interface RouteParams<TRequest, TResponse, TNextFunction, TResult> {
  guardList: MiddlewareHandler<
    TRequest,
    TResponse,
    TNextFunction,
    TResult | undefined
  >[];
  handler: RequestHandler<TRequest, TResponse, TNextFunction, TResult>;
  path: string;
  postHandlerMiddlewareList: MiddlewareHandler<
    TRequest,
    TResponse,
    TNextFunction,
    TResult
  >[];
  preHandlerMiddlewareList: MiddlewareHandler<
    TRequest,
    TResponse,
    TNextFunction,
    TResult
  >[];
  requestMethodType: RequestMethodType;
}
