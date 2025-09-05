/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Interceptor<TRequest = any, TResponse = any> {
  intercept(
    request: TRequest,
    response: TResponse,
    next: () => Promise<void>,
  ): Promise<void>;
}
