export type CustomParameterDecoratorHandler<
  TRequest = unknown,
  TResponse = unknown,
  TResult = unknown,
> = (request: TRequest, response: TResponse) => Promise<TResult> | TResult;
