import { type MiddlewareHandler } from './MiddlewareHandler.js';
import { type RequestHandler } from './RequestHandler.js';
import { type RequestMethodType } from './RequestMethodType.js';
import { type RequestTransformer } from './RequestTransformer.js';

export interface RouteParams<TRequest, TResponse, TNextFunction, TResult> {
  guardList: MiddlewareHandler<
    TRequest,
    TResponse,
    TNextFunction,
    TResult | undefined
  >[];
  handleError: (
    request: TRequest,
    response: TResponse,
    error: unknown,
  ) => Promise<TResult>;
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
  requestTransformerList: RequestTransformer<TRequest, TResponse>[] | undefined;
  routeValueMetadataMap: Map<string | symbol, unknown> | undefined;
}
