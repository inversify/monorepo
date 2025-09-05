export type RequestHandler<
  TRequest,
  TResponse,
  TNextFunction,
  TResult = unknown,
> = (
  req: TRequest,
  res: TResponse,
  next: TNextFunction,
) => Promise<TResult> | TResult;
