import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer.js';
import { type Server } from '../../server/models/Server.js';
import {
  NextUwebsocketsController,
  UwebsocketsNextInterceptor,
} from './decoratorApiNextUwebsockets.js';

describe('Decorator API (Next - uWebSockets.js)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(UwebsocketsNextInterceptor).toSelf().inSingletonScope();
    container.bind(NextUwebsocketsController).toSelf().inSingletonScope();

    server = await buildUwebSocketsJsServer(container);
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
