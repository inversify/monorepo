import { HttpStatusCode } from '@inversifyjs/http-core';

import { SseStream } from '../../stream/models/SseStream';
import { MessageEvent } from './MessageEvent';

export interface SsePublisherOptions {
  events: AsyncIterable<MessageEvent> | SseStream;
  statusCode?: HttpStatusCode;
}
