import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { Server } from '../../server/models/Server';
import { RequestExpressController } from './decoratorApiRequestExpress4';

describe('Decorator API (Request - Express 4)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(RequestExpressController).toSelf().inSingletonScope();

    server = await buildExpress4Server(container);
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
