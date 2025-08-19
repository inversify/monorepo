import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { Server } from '../../server/models/Server';
import { RequestExpressController } from './decoratorApiRequestExpress';

describe('Decorator API (Request - Express 5)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(RequestExpressController).toSelf().inSingletonScope();

    server = await buildExpressServer(container);
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
