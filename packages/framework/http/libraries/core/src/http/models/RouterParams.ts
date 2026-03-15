import { type RouteParams } from './RouteParams.js';

export interface RouterParams<TRequest, TResponse, TNextFunction, TResult> {
  path: string;
  routeParamsList: RouteParams<TRequest, TResponse, TNextFunction, TResult>[];
}
