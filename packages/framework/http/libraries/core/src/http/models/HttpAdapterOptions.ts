import {
  type EventSink,
  type HttpInstrumentationEvent,
} from '@inversifyjs/http-instrumentation-core';
import { type Logger } from '@inversifyjs/logger';

export interface HttpAdapterOptions {
  instrumentation?: readonly EventSink<HttpInstrumentationEvent>[];
  logger?: boolean | Logger;
}
