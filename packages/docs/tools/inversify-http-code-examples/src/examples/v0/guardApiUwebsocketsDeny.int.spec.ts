import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Controller, Get, UseGuard } from '@inversifyjs/http-core';
import { Container } from 'inversify';

import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer';
import { Server } from '../../server/models/Server';
import { UwebsocketsDenyGuard } from './guardApiUwebsocketsDeny';

describe('Guard API deny (uWebSockets.js)', () => {
  let server: Server;

  beforeAll(async () => {
    @Controller('/ping')
    class PingController {
      @UseGuard(UwebsocketsDenyGuard)
      @Get()
      public async get(): Promise<string> {
        return 'pong';
      }
    }

    const container: Container = new Container();
    container.bind(UwebsocketsDenyGuard).toSelf().inSingletonScope();
    container.bind(PingController).toSelf().inSingletonScope();

    server = await buildUwebSocketsJsServer(container);
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it('should block request with 403 Forbidden', async () => {
    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/ping`,
    );
    const body: unknown = await response.json();

    expect(response.status).toBe(403);
    expect(body).toMatchObject({
      message: 'Missing or invalid credentials',
    });
  });
});
