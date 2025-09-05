export type ArrayValue<T> = T extends Array<infer U> ? U : never;
