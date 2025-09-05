/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Middleware<
  TRequest = any,
  TResponse = any,
  TNextFunction = any,
  TResult = any,
> {
  execute(
    request: TRequest,
    response: TResponse,
    next: TNextFunction,
  ): Promise<TResult> | TResult;
}
