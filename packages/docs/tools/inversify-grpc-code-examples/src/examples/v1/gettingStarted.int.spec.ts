import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Server } from '@grpc/grpc-js';

import {
  connectHeroClient,
  getHero,
  type HeroClient,
  shutdownServer,
  usingClient,
} from '../../testing/grpcTestServer.js';
import { type HeroResponse } from './generated/hero.js';
import { type StartedGrpcServer, startGrpcServer } from './gettingStarted.js';

describe('gettingStarted', () => {
  let started: StartedGrpcServer;

  beforeAll(async () => {
    started = await startGrpcServer('127.0.0.1:0');
  });

  afterAll(async () => {
    await shutdownServer(started.server);
  });

  it('should bind a grpc-js server', () => {
    expect(started.server).toBeInstanceOf(Server);
    expect(started.port).toBeGreaterThan(0);
  });

  it('should return the requested hero name', async () => {
    await usingClient(
      connectHeroClient(`127.0.0.1:${started.port.toString()}`),
      async (client: HeroClient): Promise<void> => {
        const response: HeroResponse = await getHero(client, 'hero-1');

        expect(response).toStrictEqual({
          name: 'hero-1',
        });
      },
    );
  });
});
