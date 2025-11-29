import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer';
import { Server } from '../../server/models/Server';
import { NotificationsController } from './ecosystemSseMessageEventTypes';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpress4Server],
  [buildExpressServer],
  [buildFastifyServer],
  [buildHonoServer],
  [buildUwebSocketsJsServer],
])(
  'Ecosystem SSE (Message Event Types)',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();
      container.bind(NotificationsController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    describe('when connecting to the SSE endpoint', () => {
      let response: Response;

      beforeAll(async () => {
        const fetchRequest: Request = new Request(
          `http://${server.host}:${server.port.toString()}/notifications`,
          {
            method: 'GET',
            mode: 'no-cors',
            redirect: 'follow',
          },
        );

        response = await fetch(fetchRequest);
      });

      it('should return "text/event-stream" Content-Type header', () => {
        expect(response.headers.get('content-type')).toStrictEqual(
          expect.stringContaining('text/event-stream'),
        );
      });

      it('should return Cache-Control header with "no-cache"', () => {
        expect(response.headers.get('cache-control')).toStrictEqual(
          expect.stringContaining('no-cache'),
        );
      });

      it('should return "keep-alive" Connection header', () => {
        expect(response.headers.get('connection')).toBe('keep-alive');
      });

      it('should return "chunked" Transfer-Encoding header', () => {
        expect(response.headers.get('transfer-encoding')).toBe('chunked');
      });

      it('should return a 200 response', () => {
        expect(response.status).toBe(200);
      });

      describe('when reading the response', () => {
        let responseText: string;

        beforeAll(async () => {
          responseText = await response.text();
        });

        it('should return messages with different event types and properties', () => {
          // Simple message with just data
          expect(responseText).toContain('data: Hello, world!\n\n');

          // Message with event type
          expect(responseText).toContain('event: notification\n');
          expect(responseText).toContain('data: New notification\n');

          // Message with ID and type
          expect(responseText).toContain('event: update\n');
          expect(responseText).toContain('id: 123\n');
          expect(responseText).toContain('data: Important update\n');

          // Message with retry interval
          expect(responseText).toContain('event: status\n');
          expect(responseText).toContain('retry: 5000\n');
          expect(responseText).toContain('data: Status changed\n');

          // Multi-line data
          expect(responseText).toContain('event: multiline\n');
          expect(responseText).toContain('data: Line 1\n');
          expect(responseText).toContain('data: Line 2\n');
          expect(responseText).toContain('data: Line 3\n');
        });

        it('should format SSE messages correctly', () => {
          // Verify proper SSE format with double newlines between messages
          const messages: string[] = responseText.split('\n\n').filter(Boolean);

          expect(messages.length).toBeGreaterThanOrEqual(5);

          // First message: simple data only
          expect(messages[0]).toBe('data: Hello, world!');

          // Second message: with event type
          expect(messages[1]).toMatch(
            /event: notification\ndata: New notification/,
          );

          // Third message: with event type and id
          expect(messages[2]).toMatch(
            /event: update\nid: 123\ndata: Important update/,
          );

          // Fourth message: with event type and retry
          expect(messages[3]).toMatch(
            /event: status\nretry: 5000\ndata: Status changed/,
          );

          // Fifth message: multiline data
          expect(messages[4]).toMatch(
            /event: multiline\ndata: Line 1\ndata: Line 2\ndata: Line 3/,
          );
        });
      });
    });
  },
);
