import { isPromise } from '@inversifyjs/common';

/**
 * CSP-safe counterpart to `buildResolveMany`.
 *
 * `buildResolveMany` emits a fixed-arity helper with the `Function`
 * constructor so it cannot run under a strict Content Security Policy.
 * This helper accepts a variable number of resolved values followed by a
 * `build` callback and uses `Promise.all` when any value is async.
 */
export function resolveMany(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  ...args: [...unknown[], Function]
): unknown {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const build: Function = args[args.length - 1] as Function;
  const values: unknown[] = args.slice(0, -1);

  for (const value of values) {
    if (isPromise(value)) {
      return Promise.all(values).then(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        (resolvedValues: unknown[]) => build(...resolvedValues),
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  return build(...values);
}
