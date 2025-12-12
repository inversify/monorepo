import { CloneableFunction } from './CloneableFunction';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type Cloneable<T> = T extends Function
  ? CloneableFunction
  : T extends string | number | boolean | bigint | symbol | null | undefined
    ? T
    : T extends [infer F]
      ? [Cloneable<F>]
      : T extends [infer F, ...infer R]
        ? [Cloneable<F>, ...Cloneable<R>]
        : T extends Iterable<infer U>
          ? Cloneable<U>[]
          : T extends object
            ? { [K in keyof T]: Cloneable<T[K]> }
            : T;
