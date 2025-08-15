import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Controller, Get, UseGuard } from '@inversifyjs/http-core';
import { Container } from 'inversify';

import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { Server } from '../../server/models/Server';
import { HonoAllowGuard } from './guardApiHonoAllow';

describe('Guard API (Hono)', () => {
  let server: Server;

  beforeAll(async () => {
    @Controller('/ping')
    class PingController {
      @UseGuard(HonoAllowGuard)
      @Get()
      public async get(): Promise<string> {
        return 'pong';
      }
    }

    const container: Container = new Container();
    container.bind(HonoAllowGuard).toSelf().inSingletonScope();
    container.bind(PingController).toSelf().inSingletonScope();

    server = await buildHonoServer(container);
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it('should allow request and return pong', async () => {
    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/ping`,
    );
    const body: string = await response.text();

    expect(response.status).toBe(200);
    expect(body).toBe('pong');
  });
});
