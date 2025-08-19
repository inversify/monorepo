import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { Server } from '../../server/models/Server';
import { ResponseFastifyController } from './decoratorApiResponseFastify';

describe('Decorator API (Response - Fastify)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(ResponseFastifyController).toSelf().inSingletonScope();

    server = await buildFastifyServer(container);
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it('should send a JSON response using the native reply', async () => {
    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/message`,
    );
    const body: { message: string } = (await response.json()) as {
      message: string;
    };

    expect(response.status).toBe(200);
    expect(body).toStrictEqual({ message: 'hello' });
  });
});
