import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer';
import { Server } from '../../server/models/Server';
import { RequestUwebsocketsController } from './decoratorApiRequestUwebsockets';

describe('Decorator API (Request - uWebSockets.js)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(RequestUwebsocketsController).toSelf().inSingletonScope();

    server = await buildUwebSocketsJsServer(container);
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
