export type GrpcMethodHandler<
  TCall = unknown,
  TCallback = unknown,
  TResult = unknown,
> = (call: TCall, callback?: TCallback) => Promise<TResult | undefined>;
