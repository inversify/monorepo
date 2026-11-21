// A required property stays required. A property whose type includes undefined
// becomes optional, because those values are removed.
type OmitUndefined<TRecord> = {
  [
    TKey in keyof TRecord as undefined extends TRecord[TKey] ? never : TKey
  ]: TRecord[TKey];
} & {
  [
    TKey in keyof TRecord as undefined extends TRecord[TKey] ? TKey : never
  ]?: Exclude<TRecord[TKey], undefined>;
};

export function omitUndefined<TRecord extends object>(
  record: TRecord,
): OmitUndefined<TRecord> {
  // Object.fromEntries is typed as a string-keyed record. The mapping above
  // is the type of the filtered input.
  return Object.fromEntries(
    Object.entries(record).filter(
      ([, value]: [string, unknown]): boolean => value !== undefined,
    ),
  ) as OmitUndefined<TRecord>;
}
