import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';
import { Container } from 'inversify';

import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { Server } from '../../server/models/Server';
import { HonoCustomHeaderMiddleware } from './middlewareApiHonoSetHeader';

describe('Middleware API (Hono)', () => {
  let server: Server;

  beforeAll(async () => {
    @Controller('/ping')
    class PingController {
      @ApplyMiddleware(HonoCustomHeaderMiddleware)
      @Get()
      public async get(): Promise<string> {
        return 'pong';
      }
    }

    const container: Container = new Container();
    container.bind(HonoCustomHeaderMiddleware).toSelf().inSingletonScope();
    container.bind(PingController).toSelf().inSingletonScope();

    server = await buildHonoServer(container);
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it('should set a custom header from middleware', async () => {
    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/ping`,
    );
    const body: string = await response.text();

    expect(body).toBe('pong');
    expect(response.headers.get('custom-header')).toBe('value');
  });
});
