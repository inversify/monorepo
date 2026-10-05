import { type ServerDuplexStream } from '@grpc/grpc-js';
import { RPC, Service } from '@inversifyjs/grpc-core';

import {
  type ChatMessage,
  heroChatServiceDefinition,
} from './loadHeroServiceDefinition.js';

@Service(heroChatServiceDefinition)
export class HeroChatService {
  @RPC('Chat')
  public chat(call: ServerDuplexStream<ChatMessage, ChatMessage>): void {
    call.on('data', (message: ChatMessage): void => {
      call.write({
        text: message.text,
      });
    });
    call.on('end', (): void => {
      call.end();
    });
  }
}
