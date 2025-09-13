import { MiddlewareHandler } from './MiddlewareHandler';
import { RouteParams } from './RouteParams';

export interface RouterParams<TRequest, TResponse, TNextFunction, TResult> {
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
  routeParamsList: RouteParams<TRequest, TResponse, TNextFunction, TResult>[];
}
