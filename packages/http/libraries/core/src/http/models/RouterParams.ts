import { RequestHandler } from './RequestHandler';
import { RouteParams } from './RouteParams';

export interface RouterParams<TRequest, TResponse, TNextFunction> {
  guardList: RequestHandler<TRequest, TResponse, TNextFunction>[] | undefined;
  path: string;
  postHandlerMiddlewareList:
    | RequestHandler<TRequest, TResponse, TNextFunction>[]
    | undefined;
  preHandlerMiddlewareList:
    | RequestHandler<TRequest, TResponse, TNextFunction>[]
    | undefined;
  routeParamsList: RouteParams<TRequest, TResponse, TNextFunction>[];
}
