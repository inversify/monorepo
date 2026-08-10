import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer.js';
import { type Server } from '../../server/models/Server.js';
import { TenantsController } from './requestTransformersUwebsockets.js';

describe('Request transformers (uWebSockets.js)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();

    container.bind(TenantsController).toSelf().inSingletonScope();

    server = await buildUwebSocketsJsServer(container);
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it('should run the request transformer before the route handler', async () => {
    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/tenants/current`,
      {
        headers: {
          'x-tenant-id': 'acme',
        },
      },
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe('acme');
  });
});
