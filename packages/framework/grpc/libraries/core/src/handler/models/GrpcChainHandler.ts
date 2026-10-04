export type GrpcChainHandler<TRequest, TResponse, TResult> = (
  request: TRequest,
  response: TResponse,
  next: () => void,
) => Promise<TResult | undefined>;
