import { InterceptorTransformObject } from './InterceptorTransformObject';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Interceptor<TRequest = any, TResponse = any> {
  intercept(
    request: TRequest,
    response: TResponse,
    next: () => Promise<InterceptorTransformObject>,
  ): Promise<void>;
}
