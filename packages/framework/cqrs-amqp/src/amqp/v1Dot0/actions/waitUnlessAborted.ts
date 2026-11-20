import { getAbortReason } from '../calculations/getAbortReason.js';

export async function waitUnlessAborted<T>(
  promise: Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  if (signal.aborted) {
    throw getAbortReason(signal);
  }

  let onAbort: () => void = (): void => {};

  const abortion: Promise<never> = new Promise<never>(
    (
      _resolve: (value: never) => void,
      reject: (error: Error) => void,
    ): void => {
      onAbort = (): void => {
        reject(getAbortReason(signal));
      };

      signal.addEventListener('abort', onAbort, { once: true });
    },
  );

  try {
    return await Promise.race([promise, abortion]);
  } finally {
    signal.removeEventListener('abort', onAbort);
  }
}
