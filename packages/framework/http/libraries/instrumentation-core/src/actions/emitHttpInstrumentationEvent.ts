import { type EventSink } from '../models/EventSink.js';
import { type HttpInstrumentationEvent } from '../models/HttpInstrumentationEvent.js';

export function emitHttpInstrumentationEvent(
  sinks: readonly EventSink<HttpInstrumentationEvent>[],
  event: HttpInstrumentationEvent,
  reportSinkError: (error: unknown) => void,
): void {
  const publishedEvent: HttpInstrumentationEvent = Object.freeze(event);

  for (const sink of sinks) {
    try {
      // EventSink.emit is typed as void, and an async implementation still type-checks.
      // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
      const result: unknown = sink.emit(publishedEvent);

      if (isThenable(result)) {
        void result.then(undefined, (error: unknown): void => {
          reportSinkError(error);
        });
      }
    } catch (error: unknown) {
      reportSinkError(error);
    }
  }
}

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  );
}
