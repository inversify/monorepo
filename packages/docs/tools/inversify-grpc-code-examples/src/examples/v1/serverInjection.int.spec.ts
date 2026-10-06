import { describe, expect, it } from 'vitest';

import { type Container } from 'inversify';

import {
  connectHeroClient,
  getHero,
  type HeroClient,
  usingClient,
  withServer,
} from '../../testing/grpcTestServer.js';
import { type HeroResponse } from './loadHeroServiceDefinition.js';
import { ServerAwareHeroService } from './serverInjection.js';

describe('serverInjection', () => {
  it('should inject the grpc-js server after build', async () => {
    await withServer(
      (container: Container): void => {
        container.bind(ServerAwareHeroService).toSelf();
      },
      async (address: string): Promise<void> => {
        await usingClient(
          connectHeroClient(address),
          async (client: HeroClient): Promise<void> => {
            const response: HeroResponse = await getHero(client, 'hero-1');

            expect(response).toStrictEqual({
              name: 'hero-1',
            });
          },
        );
      },
    );
  });
});
