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
import {
  heroServiceIdentifier,
  SingletonHeroService,
} from './serviceOptions.js';

describe('serviceOptions', () => {
  it('should bind one singleton under the custom identifier', async () => {
    SingletonHeroService.instanceCount = 0;

    await withServer(
      (container: Container): void => {
        container.bind(heroServiceIdentifier).to(SingletonHeroService);
      },
      async (address: string, container: Container): Promise<void> => {
        const first: SingletonHeroService = await container.getAsync(
          heroServiceIdentifier,
        );
        const second: SingletonHeroService = await container.getAsync(
          heroServiceIdentifier,
        );

        expect(first).toBe(second);
        expect(SingletonHeroService.instanceCount).toBe(1);

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
