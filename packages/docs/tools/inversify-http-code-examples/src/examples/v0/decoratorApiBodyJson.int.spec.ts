import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer.js';
import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server.js';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer.js';
import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer.js';
import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer.js';
import { type Server } from '../../server/models/Server.js';
import { BodyJsonController, type UserResult } from './decoratorApiBodyJson.js';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpress4Server],
  [buildExpressServer],
  [buildFastifyServer],
  [buildHonoServer],
  [buildUwebSocketsJsServer],
])(
  'Decorator API (Body JSON)',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();
      container.bind(BodyJsonController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    it('should parse JSON body', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/users`,
        {
          body: JSON.stringify({ email: 'test@example.com', name: 'John' }),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        },
      );
      const responseBody: UserResult = (await response.json()) as UserResult;

      expect(responseBody).toStrictEqual({
        email: 'test@example.com',
        id: 1,
        name: 'John',
      });
    });
  },
);
