import { describe, expect, it } from 'vitest';

import { type Container } from 'inversify';

import {
  connectHeroClient,
  getHero,
  type HeroClient,
  usingClient,
  withServer,
} from '../../testing/grpcTestServer.js';
import { InheritedHeroService, OverridingHeroService } from './inheritance.js';
import { type HeroResponse } from './loadHeroServiceDefinition.js';

describe('inheritance', () => {
  it('should call an inherited RPC', async () => {
    await withServer(
      (container: Container): void => {
        container.bind(InheritedHeroService).toSelf();
      },
      async (address: string): Promise<void> => {
        await usingClient(
          connectHeroClient(address),
          async (client: HeroClient): Promise<void> => {
            const response: HeroResponse = await getHero(client, 'hero-1');

            expect(response).toStrictEqual({
              name: 'parent',
            });
          },
        );
      },
    );
  });

  it('should prefer the subclass RPC', async () => {
    await withServer(
      (container: Container): void => {
        container.bind(OverridingHeroService).toSelf();
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
