import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer.js';
import { type Server } from '../../server/models/Server.js';
import {
  RolesMiddleware,
  UsersController,
} from './createRouteValueMetadataUtilsUwebsockets.js';

describe('createRouteValueMetadataUtils (uWebSockets)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(RolesMiddleware).toSelf().inSingletonScope();
    container.bind(UsersController).toSelf().inSingletonScope();

    server = await buildUwebSocketsJsServer(container);
  });

  afterAll(async () => {
    await server.shutdown();
  });

  it('should set x-route-roles header from route value metadata', async () => {
    const response: Response = await fetch(
      `http://${server.host}:${server.port.toString()}/users`,
    );
    const body: string = await response.text();

    expect(body).toBe('users');
    expect(response.headers.get('x-route-roles')).toBe('admin,user');
  });
});
