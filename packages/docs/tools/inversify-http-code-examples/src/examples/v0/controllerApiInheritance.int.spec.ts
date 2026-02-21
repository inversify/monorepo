import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer.js';
import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server.js';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer.js';
import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer.js';
import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer.js';
import { type Server } from '../../server/models/Server.js';
import {
  ProductsController,
  type Resource,
  UsersController,
} from './controllerApiInheritance.js';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpress4Server],
  [buildExpressServer],
  [buildFastifyServer],
  [buildHonoServer],
  [buildUwebSocketsJsServer],
])(
  'Controller (inheritance)',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();
      container.bind(UsersController).toSelf().inSingletonScope();
      container.bind(ProductsController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    describe('UsersController (inherits all base routes)', () => {
      it('should handle GET /users', async () => {
        const response: Response = await fetch(
          `http://${server.host}:${server.port.toString()}/users`,
        );
        const body: Resource[] = (await response.json()) as Resource[];

        expect(body).toStrictEqual([
          { id: 1, name: 'Resource 1' },
          { id: 2, name: 'Resource 2' },
        ]);
      });

      it('should handle GET /users/:id', async () => {
        const response: Response = await fetch(
          `http://${server.host}:${server.port.toString()}/users/1`,
        );
        const body: Resource = (await response.json()) as Resource;

        expect(body).toStrictEqual({ id: 1, name: 'Resource 1' });
      });
    });

    describe('ProductsController (overrides list route)', () => {
      it('should handle GET /products with overridden implementation', async () => {
        const response: Response = await fetch(
          `http://${server.host}:${server.port.toString()}/products`,
        );
        const body: Resource[] = (await response.json()) as Resource[];

        expect(body).toStrictEqual([
          { id: 1, name: 'Product A' },
          { id: 2, name: 'Product B' },
          { id: 3, name: 'Product C' },
        ]);
      });

      it('should handle GET /products/:id with inherited implementation', async () => {
        const response: Response = await fetch(
          `http://${server.host}:${server.port.toString()}/products/1`,
        );
        const body: Resource = (await response.json()) as Resource;

        expect(body).toStrictEqual({ id: 1, name: 'Resource 1' });
      });
    });
  },
);
