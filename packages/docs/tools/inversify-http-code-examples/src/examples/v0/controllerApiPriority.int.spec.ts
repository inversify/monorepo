import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer';
import { Server } from '../../server/models/Server';
import {
  CreateMessageRequest,
  FallbackController,
  HealthController,
  Message,
  MessagesController,
} from './controllerApiPriority';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpress4Server],
  [buildFastifyServer],
  [buildHonoServer],
  [buildUwebSocketsJsServer],
])(
  'Controller (priority)',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();

      // Bind controllers in random order to verify priority works
      container.bind(FallbackController).toSelf().inSingletonScope();
      container.bind(HealthController).toSelf().inSingletonScope();
      container.bind(MessagesController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    it('should handle GET /api/messages (high priority)', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/api/messages`,
      );
      const body: Message[] = (await response.json()) as Message[];

      expect(response.status).toBe(200);
      expect(body).toStrictEqual([{ content: 'Hello, World!' }]);
    });

    it('should handle POST /api/messages (high priority)', async () => {
      const requestBody: CreateMessageRequest = {
        content: 'Test message',
      };

      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/api/messages`,
        {
          body: JSON.stringify(requestBody),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        },
      );
      const body: Message = (await response.json()) as Message;

      expect(response.status).toBe(201);
      expect(body).toStrictEqual({ content: 'Test message' });
    });

    it('should handle GET /api/health (default priority)', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/api/health`,
      );
      const body: { status: string } = (await response.json()) as {
        status: string;
      };

      expect(response.status).toBe(200);
      expect(body).toStrictEqual({ status: 'ok' });
    });

    it('should handle unmatched routes with fallback controller (low priority)', async () => {
      const response: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/nonexistent`,
      );

      expect(response.status).toBe(404);

      const body: { error: string; message: string } =
        (await response.json()) as { error: string; message: string };

      expect(body).toStrictEqual({
        error: 'Not Found',
        message: 'The requested resource was not found',
      });
    });

    it('should prioritize specific routes over wildcard fallback', async () => {
      // This test verifies that high priority routes are registered before low priority fallback
      const healthResponse: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/api/health`,
      );

      expect(healthResponse.status).toBe(200);

      const healthBody: { status: string } = (await healthResponse.json()) as {
        status: string;
      };

      expect(healthBody).toStrictEqual({ status: 'ok' });

      const fallbackResponse: Response = await fetch(
        `http://${server.host}:${server.port.toString()}/unknown`,
      );

      expect(fallbackResponse.status).toBe(404);

      const fallbackBody: { error: string; message: string } =
        (await fallbackResponse.json()) as { error: string; message: string };

      expect(fallbackBody).toStrictEqual({
        error: 'Not Found',
        message: 'The requested resource was not found',
      });
    });
  },
);
