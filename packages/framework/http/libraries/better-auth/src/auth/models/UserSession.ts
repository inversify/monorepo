import { BetterAuthOptions, InferSession, InferUser } from 'better-auth';

// Utility type to deeply prettify an object type. If used to be exposed in the better-auth package.
type PrettifyDeep<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? T[K]
    : T[K] extends object
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        T[K] extends any[]
        ? T[K]
        : T[K] extends Date
          ? T[K]
          : PrettifyDeep<T[K]>
      : T[K];
} & {};

export interface UserSession<TOptions extends BetterAuthOptions> {
  session: PrettifyDeep<InferSession<TOptions>>;
  user: PrettifyDeep<InferUser<TOptions>>;
}
