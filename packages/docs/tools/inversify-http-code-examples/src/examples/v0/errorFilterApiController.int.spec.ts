import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer';
import { Server } from '../../server/models/Server';
import { ProductController } from './errorFilterApiController';
import { InvalidOperationErrorFilter } from './errorFilterApiInvalidOperationErrorFilter';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpress4Server],
  [buildExpressServer],
  [buildFastifyServer],
  [buildHonoServer],
  [buildUwebSocketsJsServer],
])(
  'Error Filter API',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();
      container.bind(InvalidOperationErrorFilter).toSelf().inSingletonScope();
      container.bind(ProductController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    it('should catch InvalidOperationError and return 422 Unprocessable Entity', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/products/123/validate`,
      );
      const body: string = await response.text();
      const jsonBody: {
        message: string;
      } = JSON.parse(body);

      expect(response.status).toBe(422);
      expect(jsonBody.message).toBe(
        '[InvalidOperationError]: Product validation failed',
      );
    });
  },
);
