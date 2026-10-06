import { describe, expect, it } from 'vitest';

import { Server } from '@grpc/grpc-js';
import { Container } from 'inversify';

import {
  bindServer,
  connectHeroClient,
  getHero,
  type HeroClient,
  shutdownServer,
  usingClient,
} from '../../testing/grpcTestServer.js';
import { createAdapter, createCustomServerAdapter } from './adapterOptions.js';
import { HeroService } from './adapterOptions.js';
import { type HeroResponse } from './loadHeroServiceDefinition.js';

describe('adapterOptions', () => {
  it('should build a server from adapter options', async () => {
    const container: Container = new Container();

    container.bind(HeroService).toSelf();

    const server: Server = await createAdapter(container).build();

    try {
      const port: number = await bindServer(server, '127.0.0.1:0');

      await usingClient(
        connectHeroClient(`127.0.0.1:${port.toString()}`),
        async (client: HeroClient): Promise<void> => {
          const response: HeroResponse = await getHero(client, 'hero-1');

          expect(response).toStrictEqual({
            name: 'hero-1',
          });
        },
      );
    } finally {
      await shutdownServer(server);
    }
  });

  it('should use a custom grpc-js server', async () => {
    const container: Container = new Container();
    const server: Server = new Server();

    container.bind(HeroService).toSelf();

    const built: Server = await createCustomServerAdapter(
      container,
      server,
    ).build();

    expect(built).toBe(server);

    try {
      const port: number = await bindServer(server, '127.0.0.1:0');

      await usingClient(
        connectHeroClient(`127.0.0.1:${port.toString()}`),
        async (client: HeroClient): Promise<void> => {
          const response: HeroResponse = await getHero(client, 'hero-1');

          expect(response).toStrictEqual({
            name: 'hero-1',
          });
        },
      );
    } finally {
      await shutdownServer(server);
    }
  });
});
