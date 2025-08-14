import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';
import { Container } from 'inversify';

import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { Server } from '../../server/models/Server';
import { FastifyCustomHeaderMiddleware } from './middlewareApiFastifySetHeader';

describe('Middleware API (Fastify)', () => {
  let server: Server;

  beforeAll(async () => {
    @Controller('/ping')
    class PingController {
      @ApplyMiddleware(FastifyCustomHeaderMiddleware)
      @Get()
      public async get(): Promise<string> {
        return 'pong';
      }
    }

    const container: Container = new Container();
    container.bind(FastifyCustomHeaderMiddleware).toSelf().inSingletonScope();
    container.bind(PingController).toSelf().inSingletonScope();

    server = await buildFastifyServer(container);
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
