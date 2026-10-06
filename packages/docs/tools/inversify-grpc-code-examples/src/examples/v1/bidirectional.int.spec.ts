import { describe, expect, it } from 'vitest';

import { type Container } from 'inversify';

import {
  connectHeroChatClient,
  type HeroChatClient,
  readChat,
  usingClient,
  withServer,
} from '../../testing/grpcTestServer.js';
import { HeroChatService } from './bidirectional.js';
import { type ChatMessage } from './loadHeroServiceDefinition.js';

describe('bidirectional', () => {
  it('should echo chat messages', async () => {
    await withServer(
      (container: Container): void => {
        container.bind(HeroChatService).toSelf();
      },
      async (address: string): Promise<void> => {
        await usingClient(
          connectHeroChatClient(address),
          async (client: HeroChatClient): Promise<void> => {
            const messages: ChatMessage[] = await readChat(client, [
              'hi',
              'there',
            ]);

            expect(messages).toStrictEqual([
              {
                text: 'hi',
              },
              {
                text: 'there',
              },
            ]);
          },
        );
      },
    );
  });
});
