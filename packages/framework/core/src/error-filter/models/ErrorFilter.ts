/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ErrorFilter<
  TError = unknown,
  TRequest = any,
  TResponse = any,
  TResult = any,
> {
  catch(
    error: TError,
    request: TRequest,
    response: TResponse,
  ): Promise<TResult> | TResult;
}
