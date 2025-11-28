import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer';
import { Server } from '../../server/models/Server';
import {
  AuthMiddleware,
  User,
  UsersController,
} from './customUserSessionParameterDecorator';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpress4Server],
  [buildExpressServer],
  [buildFastifyServer],
  [buildHonoServer],
  [buildUwebSocketsJsServer],
])(
  'Decorator API (createCustomParameterDecorator)',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();
      container.bind(AuthMiddleware).toSelf().inSingletonScope();
      container.bind(UsersController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    it('should read JSON body', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/api/users/me`,
        {
          headers: { 'content-type': 'application/json' },
          method: 'GET',
        },
      );
      const responseBody: User = (await response.json()) as User;

      expect(responseBody).toStrictEqual({
        id: 'a08a7eb9-95c7-46de-94c3-f40dd934825f',
        username: 'mail@example.com',
      });
    });
  },
);
