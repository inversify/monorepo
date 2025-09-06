/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ErrorFilter<TRequest = any, TResponse = any> {
  catch(
    error: unknown,
    request: TRequest,
    response: TResponse,
  ): void | Promise<void>;
}
