import { type HttpStatusCode } from '@inversifyjs/http-core';

import { type SseStream } from '../../stream/models/SseStream.js';
import { type MessageEvent } from './MessageEvent.js';

export interface SsePublisherOptions {
  events: AsyncIterable<MessageEvent> | SseStream;
  statusCode?: HttpStatusCode;
}
