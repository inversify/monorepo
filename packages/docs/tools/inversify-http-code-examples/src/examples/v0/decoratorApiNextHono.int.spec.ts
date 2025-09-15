import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { Server } from '../../server/models/Server';
import {
  HonoNextInterceptor,
  NextHonoController,
} from './decoratorApiNextHono';

describe('Decorator API (Next - Hono)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(HonoNextInterceptor).toSelf().inSingletonScope();
    container.bind(NextHonoController).toSelf().inSingletonScope();

    server = await buildHonoServer(container);
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it('should set header in pre-handler middleware and return body from controller', async () => {
    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/next`,
    );
    const body: string = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('next-was-called')).toBe('true');
    expect(body).toBe('ok');
  });
});
