import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer.js';
import { type Server } from '../../server/models/Server.js';
import { RequestHonoController } from './decoratorApiRequestHono.js';

describe('Decorator API (Request - Hono)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(RequestHonoController).toSelf().inSingletonScope();

    server = await buildHonoServer(container);
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it('should provide the native request to read headers', async () => {
    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/headers`,
      { headers: { 'x-test-header': 'value' } },
    );
    const body: string = await response.text();

    expect(response.status).toBe(200);
    expect(body).toBe('value');
  });
});
