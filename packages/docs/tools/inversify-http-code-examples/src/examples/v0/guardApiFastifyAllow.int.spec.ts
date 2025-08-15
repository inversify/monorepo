import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Controller, Get, UseGuard } from '@inversifyjs/http-core';
import { Container } from 'inversify';

import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { Server } from '../../server/models/Server';
import { FastifyAllowGuard } from './guardApiFastifyAllow';

describe('Guard API (Fastify)', () => {
  let server: Server;

  beforeAll(async () => {
    @Controller('/ping')
    class PingController {
      @UseGuard(FastifyAllowGuard)
      @Get()
      public async get(): Promise<string> {
        return 'pong';
      }
    }

    const container: Container = new Container();
    container.bind(FastifyAllowGuard).toSelf().inSingletonScope();
    container.bind(PingController).toSelf().inSingletonScope();

    server = await buildFastifyServer(container);
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
