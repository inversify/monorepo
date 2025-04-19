import { ApplyMiddlewareOptions } from '../models/ApplyMiddlewareOptions';

export function isApplyMiddlewareOptions(
  value: unknown,
): value is ApplyMiddlewareOptions {
  const applyMiddlewareOptions: Partial<ApplyMiddlewareOptions> =
    value as Partial<ApplyMiddlewareOptions>;

  return (
    value !== undefined &&
    value !== null &&
    typeof applyMiddlewareOptions === 'object' &&
    typeof applyMiddlewareOptions.middleware === 'function' &&
    typeof applyMiddlewareOptions.phase === 'string'
  );
}
