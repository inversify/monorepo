import { type GrpcMethodHandler } from './GrpcMethodHandler.js';

export type GrpcServiceImplementation<
  TCall = unknown,
  TCallback = unknown,
  TResult = unknown,
> = Record<string, GrpcMethodHandler<TCall, TCallback, TResult>>;
