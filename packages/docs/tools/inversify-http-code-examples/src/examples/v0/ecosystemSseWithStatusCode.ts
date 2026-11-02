import { Controller, Get, HttpStatusCode } from '@inversifyjs/http-core';
import {
  type MessageEvent,
  SsePublisher,
  type SsePublisherOptions,
} from '@inversifyjs/http-sse';

// Begin-example
@Controller('/events')
export class EventsController {
  @Get('/custom-status')
  public getEventsWithCustomStatus(
    @SsePublisher()
    ssePublisher: (options: SsePublisherOptions) => unknown,
  ): unknown {
    return ssePublisher({
      events: this.#generateEvents(),
      statusCode: HttpStatusCode.CREATED,
    });
  }

  async *#generateEvents(): AsyncGenerator<MessageEvent> {
    yield { data: 'Event with custom status' };
  }
}
