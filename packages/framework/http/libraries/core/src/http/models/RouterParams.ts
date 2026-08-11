import { type RouteParams } from './RouteParams.js';

export interface RouterParams<TRequest, TResponse, TNextFunction, TResult> {
  handleError: (
    request: TRequest,
    response: TResponse,
    error: unknown,
  ) => Promise<TResult>;
  path: string;
  routeParamsList: RouteParams<TRequest, TResponse, TNextFunction, TResult>[];
}
