import { InversifyValidationErrorKind } from './InversifyValidationErrorKind';

const isAppErrorSymbol: unique symbol = Symbol.for(
  '@inversifyjs/validation-common/InversifyValidationError',
);

export class InversifyValidationError extends Error {
  public [isAppErrorSymbol]: true;

  public kind: InversifyValidationErrorKind;

  constructor(
    kind: InversifyValidationErrorKind,
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);

    this[isAppErrorSymbol] = true;
    this.kind = kind;
  }

  public static is(value: unknown): value is InversifyValidationError {
    return (
      typeof value === 'object' &&
      value !== null &&
      (value as Record<string | symbol, unknown>)[isAppErrorSymbol] === true
    );
  }

  public static isErrorOfKind(
    value: unknown,
    kind: InversifyValidationErrorKind,
  ): value is InversifyValidationError {
    return InversifyValidationError.is(value) && value.kind === kind;
  }
}
