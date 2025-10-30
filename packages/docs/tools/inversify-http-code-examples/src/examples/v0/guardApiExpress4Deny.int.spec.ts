import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Controller, Get, UseGuard } from '@inversifyjs/http-core';
import { Container } from 'inversify';

import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { Server } from '../../server/models/Server';
import { Express4DenyGuard } from './guardApiExpress4Deny';

describe('Guard API deny (Express 4)', () => {
  let server: Server;

  beforeAll(async () => {
    @Controller('/ping')
    class PingController {
      @UseGuard(Express4DenyGuard)
      @Get()
      public async get(): Promise<string> {
        return 'pong';
      }
    }

    const container: Container = new Container();
    container.bind(Express4DenyGuard).toSelf().inSingletonScope();
    container.bind(PingController).toSelf().inSingletonScope();

    server = await buildExpress4Server(container);
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
