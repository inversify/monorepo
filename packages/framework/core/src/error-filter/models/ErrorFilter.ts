/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ErrorFilter<
  TError = unknown,
  TRequest = any,
  TResponse = any,
> {
  catch(
    error: TError,
    request: TRequest,
    response: TResponse,
  ): void | Promise<void>;
}
