// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Factory<TActivated, in TArgs extends unknown[] = any[]> = (
  ...args: TArgs
) => TActivated | Promise<TActivated>;
