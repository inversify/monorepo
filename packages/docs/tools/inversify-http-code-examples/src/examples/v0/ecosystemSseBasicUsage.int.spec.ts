import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer';
import { Server } from '../../server/models/Server';
import { EventsController } from './ecosystemSseBasicUsage';

describe.each<[(container: Container) => Promise<Server>]>([
  [buildExpress4Server],
  [buildExpressServer],
  [buildFastifyServer],
  [buildHonoServer],
  [buildUwebSocketsJsServer],
])(
  'Ecosystem SSE (Basic Usage)',
  (buildServer: (container: Container) => Promise<Server>) => {
    let server: Server;

    beforeAll(async () => {
      const container: Container = new Container();
      container.bind(EventsController).toSelf().inSingletonScope();

      server = await buildServer(container);
    });

    afterAll(async () => {
      await server.shutdown();
    });

    describe('when connecting to the SSE endpoint', () => {
      let response: Response;

      beforeAll(async () => {
        const fetchRequest: Request = new Request(
          `http://${server.host}:${server.port.toString()}/events`,
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

        it('should return the expected SSE formatted messages', () => {
          const expectedMessages: string =
            'data: Event 1\n\ndata: Event 2\n\ndata: Event 3\n\n';

          expect(responseText).toBe(expectedMessages);
        });
      });
    });
  },
);
