import { type InversifyValidationErrorKind } from './InversifyValidationErrorKind.js';

const isAppErrorSymbol: unique symbol = Symbol.for(
  '@inversifyjs/validation-common/InversifyValidationError',
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class InversifyValidationError<TErrors = any> extends Error {
  public [isAppErrorSymbol]: true;

  constructor(
    public readonly kind: InversifyValidationErrorKind,
    message?: string,
    options?: ErrorOptions,
    public readonly errors?: TErrors,
  ) {
    super(message, options);

    this[isAppErrorSymbol] = true;
  }

  public static is(value: unknown): value is InversifyValidationError<unknown> {
    return (
      typeof value === 'object' &&
      value !== null &&
      (value as Record<string | symbol, unknown>)[isAppErrorSymbol] === true
    );
  }

  public static isErrorOfKind(
    value: unknown,
    kind: InversifyValidationErrorKind,
  ): value is InversifyValidationError<unknown> {
    return InversifyValidationError.is(value) && value.kind === kind;
  }
}
