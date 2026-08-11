import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer.js';
import { type Server } from '../../server/models/Server.js';
import {
  type AuditEntry,
  StoreUsersController,
} from './captureRequestValuesUwebsockets.js';

describe('Capture request values (uWebSockets.js)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();

    container.bind(StoreUsersController).toSelf().inSingletonScope();

    server = await buildUwebSocketsJsServer(container);
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it('should read captured request values', async () => {
    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/store/store-1/users/user-1/audit`,
      {
        body: JSON.stringify({ action: 'login' }),
        headers: {
          'content-type': 'application/json',
          'user-agent': 'inversify-docs',
        },
        method: 'POST',
      },
    );

    const auditEntry: AuditEntry = (await response.json()) as AuditEntry;

    expect(response.status).toBe(200);
    expect(auditEntry).toStrictEqual({
      action: 'login',
      storeId: 'store-1',
      userAgent: 'inversify-docs',
      userId: 'user-1',
    });
  });
});
