import { describe, expect, it } from 'vitest';

import { type Container } from 'inversify';

import {
  connectHeroListClient,
  type HeroListClient,
  readHeroes,
  usingClient,
  withServer,
} from '../../testing/grpcTestServer.js';
import { type HeroResponse } from './loadHeroServiceDefinition.js';
import { HeroListService } from './serverStreaming.js';

describe('serverStreaming', () => {
  it('should stream two hero names', async () => {
    await withServer(
      (container: Container): void => {
        container.bind(HeroListService).toSelf();
      },
      async (address: string): Promise<void> => {
        await usingClient(
          connectHeroListClient(address),
          async (client: HeroListClient): Promise<void> => {
            const responses: HeroResponse[] = await readHeroes(
              client,
              'hero-1',
            );

            expect(responses).toStrictEqual([
              {
                name: 'hero-1-a',
              },
              {
                name: 'hero-1-b',
              },
            ]);
          },
        );
      },
    );
  });
});
