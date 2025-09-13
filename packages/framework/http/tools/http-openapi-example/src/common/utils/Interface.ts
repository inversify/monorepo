export type Interface<T> = {
  [P in keyof T]: T[P];
};
