import { type EventSink } from '../models/EventSink.js';
import { type HttpInstrumentationContext } from '../models/HttpInstrumentationContext.js';
import { type HttpInstrumentationEvent } from '../models/HttpInstrumentationEvent.js';

export function buildHttpInstrumentationContext(
  sinks: readonly EventSink<HttpInstrumentationEvent>[] | undefined,
  reportSinkError: (error: unknown) => void,
): HttpInstrumentationContext | undefined {
  if (sinks === undefined || sinks.length === 0) {
    return undefined;
  }

  return {
    reportSinkError,
    sinks,
  };
}
