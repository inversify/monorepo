import { InversifyFrameworkCoreErrorKind } from './InversifyFrameworkCoreErrorKind';

const isAppErrorSymbol: unique symbol = Symbol.for(
  '@inversifyjs/framework-core/InversifyFrameworkCoreError',
);

export class InversifyFrameworkCoreError extends Error {
  public [isAppErrorSymbol]: true;

  public kind: InversifyFrameworkCoreErrorKind;

  constructor(
    kind: InversifyFrameworkCoreErrorKind,
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);

    this[isAppErrorSymbol] = true;
    this.kind = kind;
  }

  public static is(value: unknown): value is InversifyFrameworkCoreError {
    return (
      typeof value === 'object' &&
      value !== null &&
      (value as Record<string | symbol, unknown>)[isAppErrorSymbol] === true
    );
  }

  public static isErrorOfKind(
    value: unknown,
    kind: InversifyFrameworkCoreErrorKind,
  ): value is InversifyFrameworkCoreError {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return InversifyFrameworkCoreError.is(value) && value.kind === kind;
  }
}
