import { describe, expect, it } from 'vitest';

import { type InversifyGrpcJsAdapter } from '@inversifyjs/grpc-js';
import { type Container } from 'inversify';

import {
  connectHeroClient,
  getHero,
  type HeroClient,
  usingClient,
  withServer,
} from '../../testing/grpcTestServer.js';
import { type HeroResponse } from './loadHeroServiceDefinition.js';
import { PipedHeroService, PrefixPipe, UppercasePipe } from './pipe.js';

describe('pipe', () => {
  it('should apply the parameter pipe', async () => {
    await withServer(
      (container: Container): void => {
        container.bind(PipedHeroService).toSelf();
        container.bind(PrefixPipe).toSelf();
      },
      async (address: string): Promise<void> => {
        await usingClient(
          connectHeroClient(address),
          async (client: HeroClient): Promise<void> => {
            const response: HeroResponse = await getHero(client, 'abc');

            expect(response).toStrictEqual({
              name: 'hero:abc',
            });
          },
        );
      },
    );
  });

  it('should run a global pipe before the parameter pipe', async () => {
    await withServer(
      (container: Container, adapter: InversifyGrpcJsAdapter): void => {
        container.bind(PipedHeroService).toSelf();
        container.bind(PrefixPipe).toSelf();
        container.bind(UppercasePipe).toSelf();
        adapter.useGlobalPipe(UppercasePipe);
      },
      async (address: string): Promise<void> => {
        await usingClient(
          connectHeroClient(address),
          async (client: HeroClient): Promise<void> => {
            const response: HeroResponse = await getHero(client, 'abc');

            expect(response).toStrictEqual({
              name: 'hero:ABC',
            });
          },
        );
      },
    );
  });
});
