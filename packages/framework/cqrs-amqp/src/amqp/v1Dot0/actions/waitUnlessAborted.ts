import { getAbortReason } from '../calculations/getAbortReason.js';

interface Waiter<T> {
  reject(error: unknown): void;
  resolve(value: T): void;
  stop(): void;
}

const waitersByPromise: WeakMap<
  Promise<unknown>,
  Set<Waiter<unknown>>
> = new WeakMap();

function notifyWaiters<T>(
  promise: Promise<T>,
  settle: (waiter: Waiter<T>) => void,
): void {
  const waiters: Set<Waiter<unknown>> | undefined =
    waitersByPromise.get(promise);

  waitersByPromise.delete(promise);

  if (waiters === undefined) {
    return;
  }

  for (const waiter of waiters) {
    settle(waiter);
  }
}

function trackWaiter<T>(promise: Promise<T>, waiter: Waiter<T>): void {
  let waiters: Set<Waiter<unknown>> | undefined = waitersByPromise.get(promise);

  if (waiters === undefined) {
    waiters = new Set();

    waitersByPromise.set(promise, waiters);

    promise.then(
      (value: T): void => {
        notifyWaiters(promise, (active: Waiter<T>): void => {
          active.stop();
          active.resolve(value);
        });
      },
      (error: unknown): void => {
        notifyWaiters(promise, (active: Waiter<T>): void => {
          active.stop();
          active.reject(error);
        });
      },
    );
  }

  waiters.add(waiter);
}

export async function waitUnlessAborted<T>(
  promise: Promise<T>,
  signal: AbortSignal,
): Promise<T> {
  if (signal.aborted) {
    throw getAbortReason(signal);
  }

  return new Promise<T>(
    (resolve: (value: T) => void, reject: (error: unknown) => void): void => {
      let waiter: Waiter<T> = {
        reject,
        resolve,
        stop: (): void => {},
      };

      const onAbort: () => void = (): void => {
        waitersByPromise.get(promise)?.delete(waiter);
        waiter.stop();
        reject(getAbortReason(signal));
      };

      waiter = {
        reject,
        resolve,
        stop: (): void => {
          signal.removeEventListener('abort', onAbort);
        },
      };

      trackWaiter(promise, waiter);
      signal.addEventListener('abort', onAbort, { once: true });
    },
  );
}
