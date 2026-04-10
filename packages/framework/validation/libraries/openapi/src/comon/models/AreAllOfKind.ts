export type AreAllOfKind<
  T extends readonly string[],
  TUnion extends string,
> = T extends readonly [infer F extends string, ...infer R extends string[]]
  ? F extends TUnion
    ? AreAllOfKind<R, Exclude<TUnion, F>>
    : false
  : [TUnion] extends [never]
    ? true
    : false;
