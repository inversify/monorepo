import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Controller, Get, UseGuard } from '@inversifyjs/http-core';
import { Container } from 'inversify';

import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { Server } from '../../server/models/Server';
import { Express4AllowGuard } from './guardApiExpress4Allow';

describe('Guard API (Express 4)', () => {
  let server: Server;

  beforeAll(async () => {
    @Controller('/ping')
    class PingController {
      @UseGuard(Express4AllowGuard)
      @Get()
      public async get(): Promise<string> {
        return 'pong';
      }
    }

    const container: Container = new Container();
    container.bind(Express4AllowGuard).toSelf().inSingletonScope();
    container.bind(PingController).toSelf().inSingletonScope();

    server = await buildExpress4Server(container);
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
