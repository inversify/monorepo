export type FilteredByValueType<TObject, TType> = {
  [TKey in keyof TObject as NonNullable<TObject[TKey]> extends TType
    ? string extends keyof NonNullable<TObject[TKey]>
      ? string extends keyof TType
        ? TKey
        : never
      : TKey
    : never]: TObject[TKey];
};
