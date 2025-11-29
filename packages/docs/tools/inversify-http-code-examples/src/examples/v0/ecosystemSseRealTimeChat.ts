import { Body, Controller, Get, Post } from '@inversifyjs/http-core';
import {
  SsePublisher,
  SsePublisherOptions,
  SseStream,
} from '@inversifyjs/http-sse';
import { injectable } from 'inversify';

interface ChatMessage {
  content: string;
  timestamp: string;
  username: string;
}

// Begin-example
@injectable()
class ChatService {
  readonly #streams: Set<SseStream> = new Set();

  public subscribe(): SseStream {
    const stream: SseStream = new SseStream();
    this.#streams.add(stream);

    // Clean up when stream ends
    stream.on('close', () => {
      this.#streams.delete(stream);
    });

    return stream;
  }

  public async broadcast(message: ChatMessage): Promise<void> {
    const messageData: string = JSON.stringify(message);

    for (const stream of this.#streams) {
      await stream.writeMessageEvent({
        data: messageData,
        type: 'message',
      });
    }
  }
}

@Controller('/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('/stream')
  public streamMessages(
    @SsePublisher()
    ssePublisher: (options: SsePublisherOptions) => unknown,
  ): unknown {
    const stream: SseStream = this.chatService.subscribe();

    return ssePublisher({
      events: stream,
    });
  }

  @Post('/send')
  public async sendMessage(@Body() message: ChatMessage): Promise<void> {
    await this.chatService.broadcast({
      ...message,
      timestamp: new Date().toISOString(),
    });
  }
}
