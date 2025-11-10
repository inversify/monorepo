import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer';
import { Server } from '../../server/models/Server';
import { BodyJsonController, UserResult } from './decoratorApiBodyJson';

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
