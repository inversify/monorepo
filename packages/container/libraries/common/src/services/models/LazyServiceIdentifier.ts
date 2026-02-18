import type { ServiceIdentifier } from './ServiceIdentifier.js';

const islazyServiceIdentifierSymbol: unique symbol = Symbol.for(
  '@inversifyjs/common/islazyServiceIdentifier',
);

export class LazyServiceIdentifier<TInstance = unknown> {
  public [islazyServiceIdentifierSymbol]: true;

  readonly #buildServiceId: () => ServiceIdentifier<TInstance>;

  constructor(buildServiceId: () => ServiceIdentifier<TInstance>) {
    this.#buildServiceId = buildServiceId;
    this[islazyServiceIdentifierSymbol] = true;
  }

  public static is<TInstance = unknown>(
    value: unknown,
  ): value is LazyServiceIdentifier<TInstance> {
    return (
      typeof value === 'object' &&
      value !== null &&
      (value as Partial<LazyServiceIdentifier>)[
        islazyServiceIdentifierSymbol
      ] === true
    );
  }

  public unwrap(): ServiceIdentifier<TInstance> {
    return this.#buildServiceId();
  }
}
