import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server.js';
import { type Server } from '../../server/models/Server.js';
import {
  RolesMiddleware,
  UsersController,
} from './createRouteValueMetadataUtilsExpress4.js';

describe('createRouteValueMetadataUtils (Express 4)', () => {
  let server: Server;

  beforeAll(async () => {
    const container: Container = new Container();
    container.bind(RolesMiddleware).toSelf().inSingletonScope();
    container.bind(UsersController).toSelf().inSingletonScope();

    server = await buildExpress4Server(container);
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
