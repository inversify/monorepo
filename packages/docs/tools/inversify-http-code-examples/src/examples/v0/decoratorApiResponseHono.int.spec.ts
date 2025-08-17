import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { Server } from '../../server/models/Server';
import { ResponseHonoController } from './decoratorApiResponseHono';

describe('Decorator API (Response - Hono)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(ResponseHonoController).toSelf().inSingletonScope();

    server = await buildHonoServer(container);
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it('should send a JSON response using the Context', async () => {
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
