/* eslint-disable @typescript-eslint/no-explicit-any */
export type CustomParameterDecoratorHandler<
  TCall = any,
  TResponse = any,
  TResult = any,
> = (call: TCall, response: TResponse) => Promise<TResult> | TResult;
