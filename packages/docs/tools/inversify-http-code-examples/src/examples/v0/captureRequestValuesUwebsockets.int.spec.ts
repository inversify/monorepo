import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer.js';
import { type Server } from '../../server/models/Server.js';
import {
  type AuditEntry,
  UsersController,
} from './captureRequestValuesUwebsockets.js';

describe('Capture request values (uWebSockets.js)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();

    container.bind(UsersController).toSelf().inSingletonScope();

    server = await buildUwebSocketsJsServer(container);
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it('should read captured request values after an await', async () => {
    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/users/user-1`,
      {
        headers: {
          'user-agent': 'inversify-docs',
        },
      },
    );

    const auditEntry: AuditEntry = (await response.json()) as AuditEntry;

    expect(response.status).toBe(200);
    expect(auditEntry).toStrictEqual({
      method: 'GET',
      userAgent: 'inversify-docs',
      userId: 'user-1',
    });
  });
});
