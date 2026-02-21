import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer.js';
import { type Server } from '../../server/models/Server.js';
import {
  ExpressNextInterceptor,
  NextExpressController,
} from './decoratorApiNextExpress.js';

describe('Decorator API (Next - Express 5)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(ExpressNextInterceptor).toSelf().inSingletonScope();
    container.bind(NextExpressController).toSelf().inSingletonScope();

    server = await buildExpressServer(container);
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
