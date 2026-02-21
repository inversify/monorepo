import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer.js';
import { type Server } from '../../server/models/Server.js';
import {
  MyMiddleware,
  PingController,
} from './decoratorApiApplyMiddlewareRoute.js';

describe('Decorator API (ApplyMiddleware)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(MyMiddleware).toSelf().inSingletonScope();
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
