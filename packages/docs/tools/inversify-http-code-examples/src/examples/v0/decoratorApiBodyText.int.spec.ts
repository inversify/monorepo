import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer';
import { Server } from '../../server/models/Server';
import { BodyTextController, TextResult } from './decoratorApiBodyText';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpress4Server],
  [buildExpressServer],
  [buildFastifyServer],
  [buildHonoServer],
  [buildUwebSocketsJsServer],
])(
  'Decorator API (Body Text)',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();
      container.bind(BodyTextController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    it('should parse text body', async () => {
      const textContent: string = 'This is a plain text document';
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/documents`,
        {
          body: textContent,
          headers: { 'content-type': 'text/plain' },
          method: 'POST',
        },
      );
      const responseBody: TextResult = (await response.json()) as TextResult;

      expect(responseBody).toStrictEqual({
        content: textContent,
        length: textContent.length,
      });
    });
  },
);
