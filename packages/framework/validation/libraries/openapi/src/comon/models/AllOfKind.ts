import { type AreAllOfKind } from './AreAllOfKind.js';

export type AllOfKind<T extends readonly string[], TUnion extends string> =
  AreAllOfKind<T, TUnion> extends true ? T : never;
