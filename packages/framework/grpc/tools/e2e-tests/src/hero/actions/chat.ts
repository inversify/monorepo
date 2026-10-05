import { type ClientDuplexStream } from '@grpc/grpc-js';

import { type ChatMessage } from '../generated/hero.js';
import { isChatMessageList } from '../models/ChatMessage.js';
import { type HeroClient } from '../models/HeroClient.js';
import { readStreamMessages } from './readStreamMessages.js';

export async function chat(
  client: HeroClient,
  texts: readonly string[],
): Promise<ChatMessage[]> {
  const stream: ClientDuplexStream<ChatMessage, ChatMessage> = client.chat();
  const pendingMessages: Promise<unknown[]> = readStreamMessages(stream);

  for (const text of texts) {
    stream.write({
      text,
    });
  }

  stream.end();

  const messages: unknown[] = await pendingMessages;

  if (!isChatMessageList(messages)) {
    throw new Error('Expected chat messages');
  }

  return messages;
}
