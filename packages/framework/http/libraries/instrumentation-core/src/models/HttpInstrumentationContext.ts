import { type EventSink } from './EventSink.js';
import { type HttpInstrumentationEvent } from './HttpInstrumentationEvent.js';

export interface HttpInstrumentationContext {
  readonly reportSinkError: (error: unknown) => void;
  readonly sinks: readonly EventSink<HttpInstrumentationEvent>[];
}
