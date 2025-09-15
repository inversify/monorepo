import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { Server } from '../../server/models/Server';
import {
  Express4NextInterceptor,
  NextExpress4Controller,
} from './decoratorApiNextExpress4';

describe('Decorator API (Next - Express 4)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(Express4NextInterceptor).toSelf().inSingletonScope();
    container.bind(NextExpress4Controller).toSelf().inSingletonScope();

    server = await buildExpress4Server(container);
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
