import { describe, expect, it } from 'vitest';

import { type Container } from 'inversify';

import {
  connectHeroClient,
  getHero,
  type HeroClient,
  usingClient,
  withServer,
} from '../../testing/grpcTestServer.js';
import {
  HeroRepository,
  RepositoryHeroService,
} from './dependencyInjection.js';
import { type HeroResponse } from './loadHeroServiceDefinition.js';

describe('dependencyInjection', () => {
  it('should resolve the repository for the RPC', async () => {
    await withServer(
      (container: Container): void => {
        container.bind(HeroRepository).toSelf();
        container.bind(RepositoryHeroService).toSelf();
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
