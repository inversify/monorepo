export type StringRecordValue<T> =
  T extends Record<string | symbol, infer U> ? U : never;
