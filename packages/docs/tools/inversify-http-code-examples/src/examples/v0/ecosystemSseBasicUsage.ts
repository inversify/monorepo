import { Controller, Get } from '@inversifyjs/http-core';
import {
  MessageEvent,
  SsePublisher,
  SsePublisherOptions,
} from '@inversifyjs/http-sse';

// Begin-example
@Controller('/events')
export class EventsController {
  @Get()
  public getEvents(
    @SsePublisher()
    ssePublisher: (options: SsePublisherOptions) => unknown,
  ): unknown {
    return ssePublisher({
      events: this.#generateEvents(),
    });
  }

  async *#generateEvents(): AsyncGenerator<MessageEvent> {
    yield { data: 'Event 1' };
    yield { data: 'Event 2' };
    yield { data: 'Event 3' };
  }
}
