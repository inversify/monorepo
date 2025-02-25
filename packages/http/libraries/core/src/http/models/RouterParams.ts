import { RequestHandler } from './RequestHandler';
import { RequestMethodType } from './RequestMethodType';

export interface RouterParams<TRequest, TResponse, TNextFunction> {
  handler: RequestHandler<TRequest, TResponse, TNextFunction>;
  middlewareList:
    | RequestHandler<TRequest, TResponse, TNextFunction>[]
    | undefined;
  path: string;
  requestMethodType: RequestMethodType;
}
