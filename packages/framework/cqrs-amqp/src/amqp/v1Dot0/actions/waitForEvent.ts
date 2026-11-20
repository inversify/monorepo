import { type EventEmitter } from 'node:events';

import { getAbortReason } from '../calculations/getAbortReason.js';

function isAborted(signal: AbortSignal): boolean {
  return signal.aborted;
}

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

      const rejectWait = (error: unknown): void => {
        cleanup();
        reject(
          error instanceof Error ? error : new Error('AMQP 1.0 wait failed'),
        );
      };

      for (const eventName of options.resolveOn) {
        listeners.push([
          eventName,
          (context: TContext): void => {
            try {
              if (options.shouldResolve?.(context) === false) {
                return;
              }
            } catch (error: unknown) {
              rejectWait(error);

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
              try {
                rejectWait(options.buildError(eventName, context));
              } catch (error: unknown) {
                rejectWait(error);
              }
            },
          ]);
        }
      }

      for (const [eventName, listener] of listeners) {
        options.emitter.on(eventName, listener);
      }

      options.signal.addEventListener('abort', onAbort, { once: true });

      if (isAborted(options.signal)) {
        onAbort();
      }
    },
  );
}
