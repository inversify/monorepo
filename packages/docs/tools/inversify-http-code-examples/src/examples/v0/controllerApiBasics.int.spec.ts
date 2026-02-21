import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer.js';
import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server.js';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer.js';
import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer.js';
import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer.js';
import { type Server } from '../../server/models/Server.js';
import { type Message, MessagesController } from './controllerApiBasics.js';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpress4Server],
  [buildExpressServer],
  [buildFastifyServer],
  [buildHonoServer],
  [buildUwebSocketsJsServer],
])(
  'Controller (basics)',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();
      container.bind(MessagesController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    it('should handle GET /messages/hello', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/messages/hello`,
      );
      const body: Message = (await response.json()) as Message;

      expect(body).toStrictEqual({ content: 'world' });
    });
  },
);
