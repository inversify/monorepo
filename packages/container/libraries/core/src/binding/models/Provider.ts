/**
 * @deprecated Use `Factory` instead. Provider will be removed in v8.
 * Providers exist for historical reasons from v5 when async dependencies weren't supported.
 * Factories are more flexible and can handle both sync and async operations.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Provider<TActivated, in TArgs extends unknown[] = any[]> = (
  ...args: TArgs
) => Promise<TActivated>;
