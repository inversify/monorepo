export type FilteredByValueType<TObject, TType> = {
  [TKey in keyof TObject as TObject[TKey] extends TType | undefined
    ? TKey
    : never]: TObject[TKey] extends TType | undefined ? TObject[TKey] : never;
};
