/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Controller, Get } from '@inversifyjs/http-core';
import {
  SsePublisher,
  SsePublisherOptions,
  SseStream,
} from '@inversifyjs/http-sse';

// Begin-example
@Controller('/live-updates')
export class LiveUpdatesController {
  @Get()
  public getLiveUpdates(
    @SsePublisher()
    ssePublisher: (options: SsePublisherOptions) => unknown,
  ): unknown {
    const stream: SseStream = new SseStream();

    // Send events asynchronously
    void this.#sendUpdates(stream);

    return ssePublisher({
      events: stream,
    });
  }

  async #sendUpdates(stream: SseStream): Promise<void> {
    // Write events with backpressure handling
    await stream.writeMessageEvent({ data: 'Update 1' });

    // Simulate some work
    await new Promise((resolve: (value: unknown) => void) =>
      setTimeout(resolve, 1000),
    );

    await stream.writeMessageEvent({ data: 'Update 2' });
    await stream.writeMessageEvent({ data: 'Update 3' });

    // Signal end of stream
    stream.end();
  }
}
