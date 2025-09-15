import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { Server } from '../../server/models/Server';
import {
  FastifyNextInterceptor,
  NextFastifyController,
} from './decoratorApiNextFastify';

describe('Decorator API (Next - Fastify)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(FastifyNextInterceptor).toSelf().inSingletonScope();
    container.bind(NextFastifyController).toSelf().inSingletonScope();

    server = await buildFastifyServer(container);
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
