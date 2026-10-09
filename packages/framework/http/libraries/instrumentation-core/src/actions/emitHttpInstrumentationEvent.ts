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
      sink.emit(publishedEvent);
    } catch (error: unknown) {
      reportSinkError(error);
    }
  }
}
