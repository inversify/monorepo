import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer.js';
import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server.js';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer.js';
import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer.js';
import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer.js';
import { type Server } from '../../server/models/Server.js';
import { WarehouseController } from './errorFilterApiDiscriminatedHierarchyController.js';
import {
  OutOfStockErrorFilter,
  WarehouseErrorFilter,
} from './errorFilterApiDiscriminatedHierarchyErrorFilters.js';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpress4Server],
  [buildExpressServer],
  [buildFastifyServer],
  [buildHonoServer],
  [buildUwebSocketsJsServer],
])(
  'Discriminated error filter hierarchy',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();
      container.bind(OutOfStockErrorFilter).toSelf().inSingletonScope();
      container.bind(WarehouseErrorFilter).toSelf().inSingletonScope();
      container.bind(WarehouseController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    it('should catch OutOfStockError with the subclass filter and return 409 Conflict', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/warehouse/out-of-stock`,
      );
      const body: string = await response.text();
      const jsonBody: {
        message: string;
      } = JSON.parse(body);

      expect(response.status).toBe(409);
      expect(jsonBody.message).toBe('Product SKU-1 is out of stock');
    });

    it('should catch WarehouseError with the parent filter and return 400 Bad Request', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/warehouse/closed`,
      );
      const body: string = await response.text();
      const jsonBody: {
        message: string;
      } = JSON.parse(body);

      expect(response.status).toBe(400);
      expect(jsonBody.message).toBe('Warehouse is closed');
    });

    it('should catch a subclass with the parent filter and return 400 Bad Request', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/warehouse/maintenance`,
      );
      const body: string = await response.text();
      const jsonBody: {
        message: string;
      } = JSON.parse(body);

      expect(response.status).toBe(400);
      expect(jsonBody.message).toBe('Warehouse is closed for maintenance');
    });
  },
);
