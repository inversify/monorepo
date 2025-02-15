export type BindingDeactivation<T = unknown> = (
  injectable: T,
) => void | Promise<void>;
