import { describe, expect, it } from 'vitest';

import { type Container } from 'inversify';

import {
  connectHeroUploadClient,
  type HeroUploadClient,
  uploadHeroes,
  usingClient,
  withServer,
} from '../../testing/grpcTestServer.js';
import { CallbackHeroUploadService } from './clientStreamingCallback.js';
import { type UploadResponse } from './loadHeroServiceDefinition.js';

describe('clientStreamingCallback', () => {
  it('should reply through the callback', async () => {
    await withServer(
      (container: Container): void => {
        container.bind(CallbackHeroUploadService).toSelf();
      },
      async (address: string): Promise<void> => {
        await usingClient(
          connectHeroUploadClient(address),
          async (client: HeroUploadClient): Promise<void> => {
            const response: UploadResponse = await uploadHeroes(client, [
              'a',
              'b',
            ]);

            expect(response.names).toStrictEqual(['a', 'b']);
          },
        );
      },
    );
  });
});
