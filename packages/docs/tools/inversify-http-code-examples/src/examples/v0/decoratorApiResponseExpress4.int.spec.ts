import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { Server } from '../../server/models/Server';
import { ResponseExpressController } from './decoratorApiResponseExpress4';

describe('Decorator API (Response - Express 4)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(ResponseExpressController).toSelf().inSingletonScope();

    server = await buildExpress4Server(container);
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it('should send a JSON response using the native response', async () => {
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
