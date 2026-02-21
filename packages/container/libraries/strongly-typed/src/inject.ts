/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BindingMap } from './container.js';

type TypedDecorator<T> = <TTarget, TKey, TIndex>(
  target: TTarget extends new (...args: any[]) => any
    ? TTarget
    : TKey extends keyof TTarget
      ? Record<TKey, T>
      : never,
  key: TKey extends keyof TTarget ? TKey : PropertyKey | undefined,
  indexOrPropertyDescriptor?: TTarget extends new (...args: infer P) => any
    ? TIndex extends keyof P
      ? P[TIndex] extends T
        ? TIndex
        : never
      : never
    : unknown,
) => void;

export type TypedInject<TBindingMap extends BindingMap> = <
  TKey extends keyof TBindingMap,
>(
  identifier: TKey,
) => TypedDecorator<Awaited<TBindingMap[TKey]>>;

export type TypedMultiInject<TBindingMap extends BindingMap> = <
  TKey extends keyof TBindingMap,
>(
  identifier: TKey,
) => TypedDecorator<Array<Awaited<TBindingMap[TKey]>>>;
