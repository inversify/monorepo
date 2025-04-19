/* eslint-disable @typescript-eslint/no-explicit-any */
export type CustomParameterDecoratorHandler<
  TRequest = any,
  TResponse = any,
  TResult = any,
> = (request: TRequest, response: TResponse) => Promise<TResult> | TResult;
