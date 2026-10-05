import { describe, expect, it } from 'vitest';

import { type Container } from 'inversify';

import {
  connectHeroUploadClient,
  type HeroUploadClient,
  uploadHeroes,
  usingClient,
  withServer,
} from '../../testing/grpcTestServer.js';
import { HeroUploadService } from './clientStreaming.js';
import { type UploadResponse } from './loadHeroServiceDefinition.js';

describe('clientStreaming', () => {
  it('should collect uploaded hero names', async () => {
    await withServer(
      (container: Container): void => {
        container.bind(HeroUploadService).toSelf();
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
