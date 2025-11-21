import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Controller, Get, HttpResponse } from '@inversifyjs/http-core';
import { Container } from 'inversify';

import { buildExpressServer } from '../../server/adapter/express/actions/buildExpressServer';
import { buildExpress4Server } from '../../server/adapter/express4/actions/buildExpress4Server';
import { buildFastifyServer } from '../../server/adapter/fastify/actions/buildFastifyServer';
import { buildHonoServer } from '../../server/adapter/hono/actions/buildHonoServer';
import { buildUwebSocketsJsServer } from '../../server/adapter/uWebSocketsJs/actions/buildUwebSocketsJsServer';
import { Server } from '../../server/models/Server';
import { MessageEvent } from '../../sse/models/MessageEvent';
import { BuildSsePublisher, SsePublisherOptions } from './BuildSsePublisher';

describe(BuildSsePublisher, () => {
  describe.each<[(container: Container) => Promise<Server>]>([
    [buildExpress4Server],
    [buildExpressServer],
    [buildFastifyServer],
    [buildHonoServer],
    [buildUwebSocketsJsServer],
  ])(
    'Having a server with an SSE endpoint',
    (buildServer: (container: Container) => Promise<Server>) => {
      let resolveYieldPromise: () => void;
      let yieldPromise: Promise<void>;

      let server: Server;

      @Controller('/messages')
      class MessagesController {
        @Get()
        public getMessages(
          @BuildSsePublisher()
          buildSsePublisher: (sseOptions: SsePublisherOptions) => HttpResponse,
        ): HttpResponse {
          return buildSsePublisher({
            events: this.#yieldData.bind(this)(),
          });
        }

        async *#yieldData(): AsyncGenerator<MessageEvent> {
          await yieldPromise;

          yield { data: 'message 1' };
          yield { data: 'message 2' };
          yield { data: 'message 3' };
        }
      }

      beforeAll(async () => {
        yieldPromise = new Promise<void>((resolve: () => void) => {
          resolveYieldPromise = resolve;
        });

        const container: Container = new Container();

        container.bind(MessagesController).toSelf().inSingletonScope();

        server = await buildServer(container);
      });

      afterAll(async () => {
        await server.shutdown();
      });

      describe('when connecting to the SSE endpoint', () => {
        let response: Response;

        beforeAll(async () => {
          const fetchRequest: Request = new Request(
            `http://${server.host}:${server.port.toString()}/messages`,
            {
              method: 'GET',
              mode: 'no-cors',
              redirect: 'follow',
            },
          );

          response = await fetch(fetchRequest);
        });

        it('should return "text/event-stream" Content-Type header', () => {
          expect(response.headers.get('Content-Type')).toStrictEqual(
            expect.stringContaining('text/event-stream'),
          );
        });

        it('should return Cache-Control header with "no-cache"', () => {
          expect(response.headers.get('Cache-Control')).toStrictEqual(
            expect.stringContaining('no-cache'),
          );
        });

        it('should return "keep-alive" Connection header', () => {
          expect(response.headers.get('Connection')).toBe('keep-alive');
        });

        it('should return a 200 response', () => {
          expect(response.status).toBe(200);
        });

        describe('when server yields data', () => {
          let responseText: string;

          beforeAll(async () => {
            resolveYieldPromise();

            responseText = await response.text();
          });

          it('should return the expected SSE formatted messages', () => {
            const expectedMessages: string =
              'data: message 1\n\ndata: message 2\n\ndata: message 3\n\n';

            expect(responseText).toBe(expectedMessages);
          });
        });
      });
    },
  );
});
