import { type EventEmitter } from 'node:events';

import { getAbortReason } from '../calculations/getAbortReason.js';

interface ResolvingWaitForEventOptions<TContext> {
  readonly emitter: EventEmitter;
  readonly resolveOn: readonly string[];
  readonly shouldResolve?: (context: TContext) => boolean;
  readonly signal: AbortSignal;
}

interface RejectingWaitForEventOptions<
  TContext,
> extends ResolvingWaitForEventOptions<TContext> {
  readonly buildError: (eventName: string, context: TContext) => Error;
  readonly rejectOn: readonly string[];
}

export type WaitForEventOptions<TContext> =
  | RejectingWaitForEventOptions<TContext>
  | ResolvingWaitForEventOptions<TContext>;

export async function waitForEvent<TContext>(
  options: WaitForEventOptions<TContext>,
): Promise<TContext> {
  return new Promise<TContext>(
    (
      resolve: (context: TContext) => void,
      reject: (error: Error) => void,
    ): void => {
      if (options.signal.aborted) {
        reject(getAbortReason(options.signal));

        return;
      }

      const listeners: [string, (context: TContext) => void][] = [];

      const cleanup: () => void = (): void => {
        for (const [eventName, listener] of listeners) {
          options.emitter.removeListener(eventName, listener);
        }

        options.signal.removeEventListener('abort', onAbort);
      };

      const onAbort: () => void = (): void => {
        cleanup();
        reject(getAbortReason(options.signal));
      };

      for (const eventName of options.resolveOn) {
        listeners.push([
          eventName,
          (context: TContext): void => {
            if (options.shouldResolve?.(context) === false) {
              return;
            }

            cleanup();
            resolve(context);
          },
        ]);
      }

      if ('rejectOn' in options) {
        for (const eventName of options.rejectOn) {
          listeners.push([
            eventName,
            (context: TContext): void => {
              cleanup();
              reject(options.buildError(eventName, context));
            },
          ]);
        }
      }

      for (const [eventName, listener] of listeners) {
        options.emitter.on(eventName, listener);
      }

      options.signal.addEventListener('abort', onAbort, { once: true });
    },
  );
}
