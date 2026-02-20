import { type InversifyCoreErrorKind } from './InversifyCoreErrorKind.js';

const isAppErrorSymbol: unique symbol = Symbol.for(
  '@inversifyjs/core/InversifyCoreError',
);

export class InversifyCoreError extends Error {
  public [isAppErrorSymbol]: true;

  public kind: InversifyCoreErrorKind;

  constructor(
    kind: InversifyCoreErrorKind,
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);

    this[isAppErrorSymbol] = true;
    this.kind = kind;
  }

  public static is(value: unknown): value is InversifyCoreError {
    return (
      typeof value === 'object' &&
      value !== null &&
      (value as Record<string | symbol, unknown>)[isAppErrorSymbol] === true
    );
  }

  public static isErrorOfKind(
    value: unknown,
    kind: InversifyCoreErrorKind,
  ): value is InversifyCoreError {
    return InversifyCoreError.is(value) && value.kind === kind;
  }
}
