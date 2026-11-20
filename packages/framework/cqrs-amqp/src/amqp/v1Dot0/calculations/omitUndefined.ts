export function omitUndefined<TRecord extends object>(
  record: TRecord,
): { [TKey in keyof TRecord]?: Exclude<TRecord[TKey], undefined> } {
  return Object.fromEntries(
    Object.entries(record).filter(
      ([, value]: [string, unknown]): boolean => value !== undefined,
    ),
  ) as { [TKey in keyof TRecord]?: Exclude<TRecord[TKey], undefined> };
}
