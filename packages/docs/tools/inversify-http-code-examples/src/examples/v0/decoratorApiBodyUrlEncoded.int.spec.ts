import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer';
import { Server } from '../../server/models/Server';
import {
  BodyUrlEncodedController,
  FormResult,
} from './decoratorApiBodyUrlEncoded';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpress4Server],
  [buildExpressServer],
  [buildFastifyServer],
  [buildHonoServer],
  [buildUwebSocketsJsServer],
])(
  'Decorator API (Body URL-encoded)',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();
      container.bind(BodyUrlEncodedController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    it('should parse URL-encoded body', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/auth/login`,
        {
          body: 'username=john&password=secret123',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          method: 'POST',
        },
      );
      const responseBody: FormResult = (await response.json()) as FormResult;

      expect(responseBody).toStrictEqual({
        password: 'secret123',
        username: 'john',
      });
    });
  },
);
