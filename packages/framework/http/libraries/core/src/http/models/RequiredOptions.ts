export type RequiredOptions<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};
