import { describe, expect, it } from 'vitest';

import { type Container } from 'inversify';

import {
  connectHeroChatClient,
  type HeroChatClient,
  readChat,
  usingClient,
  withServer,
} from '../../testing/grpcTestServer.js';
import { CallHeroChatService } from './bidirectionalCall.js';
import { type ChatMessage } from './loadHeroServiceDefinition.js';

describe('bidirectionalCall', () => {
  it('should echo chat messages from the call', async () => {
    await withServer(
      (container: Container): void => {
        container.bind(CallHeroChatService).toSelf();
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
