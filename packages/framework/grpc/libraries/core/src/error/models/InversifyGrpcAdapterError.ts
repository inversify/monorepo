import { type InversifyGrpcAdapterErrorKind } from './InversifyGrpcAdapterErrorKind.js';

const isGrpcAdapterErrorSymbol: unique symbol = Symbol.for(
  '@inversifyjs/grpc-core/InversifyGrpcAdapterError',
);

export class InversifyGrpcAdapterError extends Error {
  public [isGrpcAdapterErrorSymbol]: true;

  constructor(
    public readonly kind: InversifyGrpcAdapterErrorKind,
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);

    this[isGrpcAdapterErrorSymbol] = true;
  }

  public static is(value: unknown): value is InversifyGrpcAdapterError {
    return (
      typeof value === 'object' &&
      value !== null &&
      (value as Record<string | symbol, unknown>)[isGrpcAdapterErrorSymbol] ===
        true
    );
  }
}
