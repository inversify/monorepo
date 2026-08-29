/* eslint-disable @typescript-eslint/no-explicit-any */
import type { BindingMap } from './container.js';

// rflct type aliases — use as type annotations on properties and constructor params.
// rflct serializes TKey as the service identifier; TypeScript sees Awaited<TMap[TKey]>.
export type TypedInject<
  TKey extends keyof TMap,
  TMap extends BindingMap = BindingMap,
> = Awaited<TMap[TKey]>;

export type TypedMultiInject<
  TKey extends keyof TMap,
  TMap extends BindingMap = BindingMap,
> = Array<Awaited<TMap[TKey]>>;
