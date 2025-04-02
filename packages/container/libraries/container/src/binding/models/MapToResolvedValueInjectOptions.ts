import { ResolvedValueInjectOptions } from './ResolvedValueInjectOptions';

export type MapToResolvedValueInjectOptions<TArgs extends unknown[]> = {
  [K in keyof TArgs]-?: ResolvedValueInjectOptions<TArgs[K]>;
};
