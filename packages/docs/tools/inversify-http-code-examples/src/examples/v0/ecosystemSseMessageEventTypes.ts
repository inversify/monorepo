import { Controller, Get } from '@inversifyjs/http-core';
import {
  MessageEvent,
  SsePublisher,
  SsePublisherOptions,
} from '@inversifyjs/http-sse';

// Begin-example
@Controller('/notifications')
export class NotificationsController {
  @Get()
  public getNotifications(
    @SsePublisher()
    ssePublisher: (options: SsePublisherOptions) => unknown,
  ): unknown {
    return ssePublisher({
      events: this.#generateNotifications(),
    });
  }

  async *#generateNotifications(): AsyncGenerator<MessageEvent> {
    // Simple message with just data
    yield { data: 'Hello, world!' };

    // Message with event type
    yield {
      data: 'New notification',
      type: 'notification',
    };

    // Message with ID for client tracking
    yield {
      data: 'Important update',
      id: '123',
      type: 'update',
    };

    // Message with retry interval (milliseconds)
    yield {
      data: 'Status changed',
      retry: 5000,
      type: 'status',
    };

    // Multi-line data
    yield {
      data: ['Line 1', 'Line 2', 'Line 3'],
      type: 'multiline',
    };
  }
}
