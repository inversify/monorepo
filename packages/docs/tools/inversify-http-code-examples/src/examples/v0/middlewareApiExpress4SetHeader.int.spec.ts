import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ApplyMiddleware, Controller, Get } from '@inversifyjs/http-core';
import { Container } from 'inversify';

import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { Server } from '../../server/models/Server';
import { Express4CustomHeaderMiddleware } from './middlewareApiExpress4SetHeader';

describe('Middleware API (Express 4)', () => {
  let server: Server;

  beforeAll(async () => {
    @Controller('/ping')
    class PingController {
      @ApplyMiddleware(Express4CustomHeaderMiddleware)
      @Get()
      public async get(): Promise<string> {
        return 'pong';
      }
    }

    const container: Container = new Container();
    container.bind(Express4CustomHeaderMiddleware).toSelf().inSingletonScope();
    container.bind(PingController).toSelf().inSingletonScope();

    server = await buildExpress4Server(container);
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
