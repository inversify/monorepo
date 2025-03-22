export type Writable<T> = {
  -readonly [TKey in keyof T]: T[TKey];
};
