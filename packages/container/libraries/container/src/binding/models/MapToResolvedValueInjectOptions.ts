import { type ResolvedValueInjectOptions } from './ResolvedValueInjectOptions.js';

export type MapToResolvedValueInjectOptions<TArgs extends unknown[]> = {
  [K in keyof TArgs]-?: ResolvedValueInjectOptions<TArgs[K]>;
};
